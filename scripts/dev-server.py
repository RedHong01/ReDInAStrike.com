#!/usr/bin/env python3
"""Zero-dependency local dev server for the ReDInAStrikE site.

Mirrors the behaviour of server.mjs (same routing, same %BASE% / favicon
templating) but runs on the stock macOS python3, so the .app launcher does not
depend on a node install. `npm run dev` still uses server.mjs; keep the two in
sync if the routing rules ever change.

Usage: dev-server.py [root] [port]
"""

import json
import os
import posixpath
import re
import sys
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.realpath(sys.argv[1] if len(sys.argv) > 1 else ".")
PORT = int(sys.argv[2] if len(sys.argv) > 2 else os.environ.get("PORT", 5173))
HEALTH_PATH = "/__redinastrike_health"

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".otf": "font/otf",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
    ".txt": "text/plain; charset=utf-8",
}


def favicon_version():
    """Read the version from build.mjs so the two never drift."""
    try:
        build = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build.mjs")
        with open(build, "r", encoding="utf-8") as fh:
            match = re.search(r'faviconVersion\s*=\s*"([^"]+)"', fh.read())
        if match:
            return match.group(1)
    except OSError:
        pass
    return "20260904"


VERSION = favicon_version()
BASE = "./" if ROOT.endswith("dist") else "/"


def favicon_links(base):
    return "\n    ".join(
        [
            f'<link rel="icon" type="image/png" sizes="64x64" href="{base}favicon.png?v={VERSION}" />',
            f'<link rel="icon" type="image/svg+xml" href="{base}favicon.svg?v={VERSION}" />',
            f'<link rel="shortcut icon" href="{base}favicon.png?v={VERSION}" />',
            f'<link rel="apple-touch-icon" sizes="180x180" href="{base}apple-touch-icon.png?v={VERSION}" />',
            f'<link rel="apple-touch-icon-precomposed" sizes="180x180" href="{base}apple-touch-icon-precomposed.png?v={VERSION}" />',
            f'<link rel="mask-icon" href="{base}favicon.svg?v={VERSION}" color="#454545" />',
        ]
    )


def render_html(html, base):
    html = re.sub(
        r"    <!-- LOCAL_FAVICON_START -->.*?<!-- LOCAL_FAVICON_END -->\n",
        "",
        html,
        flags=re.S,
    )
    html = html.replace("<!-- BUILD_FAVICONS -->", favicon_links(base), 1)
    return html.replace("%BASE%", base)


def resolve_under(root, request_path):
    """Join and confirm the result stays inside root (blocks ../ escapes)."""
    candidate = os.path.realpath(os.path.join(root, request_path.lstrip("/")))
    if candidate == root or candidate.startswith(root + os.sep):
        return candidate
    return None


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "ReDInAStrikE-dev"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s  %s\n" % (self.log_date_time_string(), fmt % args))

    def do_HEAD(self):
        self.respond(head_only=True)

    def do_GET(self):
        self.respond()

    def respond(self, head_only=False):
        raw = urllib.parse.urlparse(self.path).path
        request_path = posixpath.normpath(urllib.parse.unquote(raw))

        if request_path == HEALTH_PATH:
            body = json.dumps(
                {"app": "redinastrike", "root": ROOT, "pid": os.getpid(), "port": PORT}
            ).encode()
            self.send_bytes(body, "application/json; charset=utf-8", head_only)
            return

        if request_path in ("/", "."):
            request_path = "/index.html"

        target = resolve_under(ROOT, request_path)

        if target and os.path.isdir(target):
            target = os.path.join(target, "index.html")

        if not (target and os.path.isfile(target)):
            fallback = resolve_under(ROOT, os.path.join("public", request_path.lstrip("/")))
            if fallback and os.path.isdir(fallback):
                fallback = os.path.join(fallback, "index.html")
            if fallback and os.path.isfile(fallback):
                target = fallback

        if not (target and os.path.isfile(target)):
            target = os.path.join(ROOT, "index.html")
            if not os.path.isfile(target):
                self.send_bytes(b"Not found", "text/plain; charset=utf-8", head_only, 404)
                return

        try:
            with open(target, "rb") as fh:
                content = fh.read()
        except OSError as err:
            self.send_bytes(str(err).encode(), "text/plain; charset=utf-8", head_only, 500)
            return

        ext = os.path.splitext(target)[1].lower()
        if ext == ".html":
            content = render_html(content.decode("utf-8"), BASE).encode("utf-8")

        self.send_bytes(content, MIME.get(ext, "application/octet-stream"), head_only)

    def send_bytes(self, body, content_type, head_only=False, status=200):
        self.send_response(status)
        self.send_header("content-type", content_type)
        self.send_header("content-length", str(len(body)))
        self.send_header("cache-control", "no-store")
        self.end_headers()
        if not head_only:
            self.wfile.write(body)


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    httpd = Server(("127.0.0.1", PORT), Handler)
    sys.stderr.write(
        "ReDInAStrikE dev server: http://127.0.0.1:%d  (root: %s)\n" % (PORT, ROOT)
    )
    sys.stderr.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
