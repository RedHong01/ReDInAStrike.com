#!/usr/bin/env python3
"""Render public/favicon.svg into a macOS .icns app icon.

Pure stdlib: parses the SVG path, flattens the beziers and scanline-fills them,
so it needs no ImageMagick / librsvg / node. Each icns size is rendered natively
rather than downscaled, which keeps the small ones crisp.

Usage: svg-to-icns.py <input.svg> <output.icns>
"""

import math
import os
import re
import struct
import subprocess
import sys
import tempfile
import zlib

INK = (0x45, 0x45, 0x45)      # brand grey, same as the favicon
PLATE = (0xFA, 0xFA, 0xF8)    # paper white, reads on both light and dark Docks
PLATE_INSET = 0.085           # margin around the rounded square
PLATE_RADIUS = 0.225          # corner radius, as a fraction of the plate
GLYPH_SCALE = 0.66            # logo size inside the plate
ICNS_TYPES = [
    (b"icp4", 16), (b"icp5", 32), (b"icp6", 64),
    (b"ic07", 128), (b"ic08", 256), (b"ic09", 512),
    (b"ic10", 1024), (b"ic11", 32), (b"ic12", 64),
    (b"ic13", 256), (b"ic14", 512),
]


# --- SVG path -> polygons --------------------------------------------------

def parse_path(d):
    toks = re.findall(r"[MLCZmlczHhVv]|-?\d*\.?\d+(?:[eE][-+]?\d+)?", d)
    subs, cur, start, pt, cmd, i = [], [], (0.0, 0.0), (0.0, 0.0), None, 0

    def num():
        nonlocal i
        v = float(toks[i])
        i += 1
        return v

    while i < len(toks):
        if re.match(r"^[A-Za-z]$", toks[i]):
            cmd = toks[i]
            i += 1
        if cmd in ("M", "m"):
            x, y = num(), num()
            if cmd == "m":
                x, y = pt[0] + x, pt[1] + y
            if cur:
                subs.append(cur)
            pt = start = (x, y)
            cur = [pt]
            cmd = "L" if cmd == "M" else "l"
        elif cmd in ("L", "l"):
            x, y = num(), num()
            if cmd == "l":
                x, y = pt[0] + x, pt[1] + y
            pt = (x, y)
            cur.append(pt)
        elif cmd in ("H", "h"):
            x = num()
            pt = (pt[0] + x if cmd == "h" else x, pt[1])
            cur.append(pt)
        elif cmd in ("V", "v"):
            y = num()
            pt = (pt[0], pt[1] + y if cmd == "v" else y)
            cur.append(pt)
        elif cmd in ("C", "c"):
            x1, y1, x2, y2, x, y = (num() for _ in range(6))
            if cmd == "c":
                x1, y1 = pt[0] + x1, pt[1] + y1
                x2, y2 = pt[0] + x2, pt[1] + y2
                x, y = pt[0] + x, pt[1] + y
            p0, steps = pt, 16
            for s in range(1, steps + 1):
                t = s / steps
                m = 1 - t
                cur.append((
                    m**3 * p0[0] + 3*m*m*t*x1 + 3*m*t*t*x2 + t**3 * x,
                    m**3 * p0[1] + 3*m*m*t*y1 + 3*m*t*t*y2 + t**3 * y,
                ))
            pt = (x, y)
        elif cmd in ("Z", "z"):
            if cur:
                cur.append(start)
                subs.append(cur)
                cur = []
            pt = start
            cmd = None
        else:
            raise ValueError("unsupported path command: %r" % cmd)
    if cur:
        subs.append(cur)
    return subs


def coverage(polys, w, h, samples=8):
    """Nonzero-winding scanline fill returning per-pixel coverage in 0..1."""
    edges = []
    for poly in polys:
        for a, b in zip(poly, poly[1:]):
            if a[1] != b[1]:
                edges.append((a[0], a[1], b[0], b[1]))
        if poly[0] != poly[-1] and poly[0][1] != poly[-1][1]:
            edges.append((poly[-1][0], poly[-1][1], poly[0][0], poly[0][1]))

    cov = [[0.0] * w for _ in range(h)]
    inv = 1.0 / samples
    for py in range(h):
        row = cov[py]
        for s in range(samples):
            yy = py + (s + 0.5) * inv
            xs = []
            for x0, y0, x1, y1 in edges:
                if (y0 <= yy < y1) or (y1 <= yy < y0):
                    xs.append((x0 + (yy - y0) / (y1 - y0) * (x1 - x0), 1 if y1 > y0 else -1))
            if not xs:
                continue
            xs.sort()
            wind, spans, sx = 0, [], 0.0
            for x, direction in xs:
                if wind == 0:
                    sx = x
                wind += direction
                if wind == 0:
                    spans.append((sx, x))
            for a, b in spans:
                if b <= 0 or a >= w:
                    continue
                a, b = max(a, 0.0), min(b, float(w))
                ia, ib = int(a), min(int(b), w - 1)
                if ia == ib:
                    row[ia] += (b - a) * inv
                else:
                    row[ia] += (ia + 1 - a) * inv
                    for px in range(ia + 1, ib):
                        row[px] += inv
                    row[ib] += (b - ib) * inv
    return cov


def rounded_rect_poly(x, y, w, h, r, steps=16):
    pts = []
    corners = [
        (x + w - r, y + r, -math.pi / 2, 0),
        (x + w - r, y + h - r, 0, math.pi / 2),
        (x + r, y + h - r, math.pi / 2, math.pi),
        (x + r, y + r, math.pi, 3 * math.pi / 2),
    ]
    for cx, cy, a0, a1 in corners:
        for s in range(steps + 1):
            a = a0 + (a1 - a0) * s / steps
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    pts.append(pts[0])
    return pts


# --- PNG -------------------------------------------------------------------

def write_png(path, w, h, rgba):
    raw = b"".join(b"\x00" + bytes(rgba[y * w * 4:(y + 1) * w * 4]) for y in range(h))

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    with open(path, "wb") as fh:
        fh.write(b"\x89PNG\r\n\x1a\n")
        fh.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        fh.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        fh.write(chunk(b"IEND", b""))


def render_icon(subs, vb, size):
    vx, vy, vw, vh = vb
    inset = size * PLATE_INSET
    plate = size - 2 * inset
    plate_cov = coverage([rounded_rect_poly(inset, inset, plate, plate, plate * PLATE_RADIUS)], size, size)

    target = plate * GLYPH_SCALE
    sc = min(target / vw, target / vh)
    ox = (size - vw * sc) / 2 - vx * sc
    oy = (size - vh * sc) / 2 - vy * sc
    glyph_cov = coverage([[(x * sc + ox, y * sc + oy) for x, y in sub] for sub in subs], size, size)

    buf = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            pa = min(1.0, max(0.0, plate_cov[y][x]))
            ga = min(1.0, max(0.0, glyph_cov[y][x])) * pa   # clip the logo to the plate
            r = PLATE[0] * (1 - ga) + INK[0] * ga
            g = PLATE[1] * (1 - ga) + INK[1] * ga
            b = PLATE[2] * (1 - ga) + INK[2] * ga
            o = (y * size + x) * 4
            buf[o], buf[o + 1], buf[o + 2], buf[o + 3] = int(r), int(g), int(b), int(round(pa * 255))
    return bytes(buf)


def main():
    svg_path, icns_path = sys.argv[1], sys.argv[2]
    svg = open(svg_path, encoding="utf-8").read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    subs = parse_path(re.search(r'\bd="([^"]*)"', svg).group(1))

    with tempfile.TemporaryDirectory() as tmp:
        iconset = os.path.join(tmp, "icon.iconset")
        os.makedirs(iconset)
        cache = {}
        for tag, size in ICNS_TYPES:
            if size not in cache:
                sys.stderr.write("  渲染 %dx%d\n" % (size, size))
                cache[size] = render_icon(subs, vb, size)
            write_png(os.path.join(iconset, "icon_%dx%d.png" % (size, size)), size, size, cache[size])
            if size > 16:
                write_png(os.path.join(iconset, "icon_%dx%d@2x.png" % (size // 2, size // 2)),
                          size, size, cache[size])
        subprocess.run(["iconutil", "-c", "icns", iconset, "-o", icns_path], check=True)
    sys.stderr.write("已生成 %s (%d 字节)\n" % (icns_path, os.path.getsize(icns_path)))


if __name__ == "__main__":
    main()
