"""Every number the Space Bounty Hunter drawer quotes, re-derived from the team's
data sheet ("Data Sheets Space Bounty Hunters", Google Sheet 1m3gXe7-8LNhuLE0hszckI_doDvyk45t11RLOZNg6HBg,
exported 2026-09-11, last edited 2026-04-23) and from Red's local copy of the same
sheet downloaded 2026-03-18 (~/Downloads/MMORPG Data Sheets.xlsx).

Run:  python3 reference/projects/space-bounty-hunter/sheet-derivations.py
"""
from fractions import Fraction as F
import math

# --- Character Stats: grade of each attribute on each combat stat (blank = no effect)
APR23 = {
    "Resolve": {"Health": "S", "Armor": "B", "Shield": "B", "Shock Resist": "C", "Toxin Resist": "C", "Burn Resist": "C", "Cryo Resist": "C", "Critical Resistance": "B"},
    "Strength": {"Health": "A", "Armor": "A", "Gun Stability": "S", "Physical Damage": "A"},
    "Agility": {"Physical Damage": "A", "Critical Chance": "A"},
    "Marksman": {"Gun Damage": "S", "Gun Stability": "A", "Physical Damage": "C", "Critical Damage": "B"},
    "Tech": {"Health": "B", "Armor": "S", "Grenade Damage": "A", "Shock Damage": "B", "Shock Resist": "B", "Damage To Robotics": "A"},
    "Hack": {"Shield": "A", "Shield Regen Rate": "S", "Grenade Cooldown": "A", "Shock Damage": "S", "Shock Resist": "S", "Cryo Damage": "B", "Cryo Resist": "B", "Damage To Robotics": "S"},
    "Biology": {"Toxin Damage": "S", "Toxin Resist": "S"},
    "Chemistry": {"Toxin Damage": "B", "Toxin Resist": "B", "Burn Damage": "S", "Burn Resist": "S", "Cryo Damage": "S", "Cryo Resist": "S"},
    "Physics": {"Shield Regen Delay": "S", "Grenade Damage": "S", "Grenade Cooldown": "S", "Physical Damage": "A", "Burn Damage": "B", "Burn Resist": "B"},
    "Perception": {"Gun Weakspot Damage": "S", "Critical Chance": "S", "Critical Resistance": "A"},
    "Stealth": {"Gun Weakspot Damage": "A", "Critical Damage": "S"},
    "Charm": {"Critical Chance": "B", "Critical Damage": "B", "Critical Resistance": "B", "Damage to Humanoids": "S"},
}
MAR18 = {
    "Resolve": {"Health": "S", "Armor": "B", "Shield": "B", "Shock Damage": "C", "Shock Resist": "C", "Toxin Damage": "C", "Toxin Resist": "C", "Burn Damage": "C", "Burn Resist": "C", "Cryo Damage": "C", "Cryo Resist": "C"},
    "Strength": {"Health": "A", "Armor": "A", "Gun Stability": "S"},
    "Agility": {},
    "Marksman": {"Gun Damage": "S"},
    "Tech": {"Health": "B", "Armor": "S"},
    "Hack": {"Shield": "A", "Shield Regen Rate": "S"},
    "Biology": {},
    "Chemistry": {},
    "Physics": {"Grenade Damage": "S", "Grenade Cooldown": "S"},
    "Perception": {"Gun Weakspot Damage": "S"},
    "Stealth": {},
    "Charm": {},
}
COLUMNS_APR23 = ["Health", "Armor", "Shield", "Shield Regen Rate", "Shield Regen Delay", "Gun Damage",
    "Gun Weakspot Damage", "Gun Stability", "Grenade Damage", "Grenade Cooldown", "Physical Damage",
    "Shock Damage", "Shock Resist", "Toxin Damage", "Toxin Resist", "Burn Damage", "Burn Resist",
    "Cryo Damage", "Cryo Resist", "Critical Chance", "Critical Damage", "Critical Resistance",
    "Damage to Humanoids", "Damage To Robotics", "Damage To Monsters"]
COLUMNS_MAR18 = 18

def matrix_report():
    kept = dropped = added = 0
    for a in APR23:
        before, after = MAR18[a], APR23[a]
        kept += sum(1 for k in after if k in before and before[k] == after[k])
        dropped += sum(1 for k in before if k not in after)
        added += sum(1 for k in after if k not in before)
    total_mar = sum(len(v) for v in MAR18.values())
    total_apr = sum(len(v) for v in APR23.values())
    idle_mar = [a for a, v in MAR18.items() if not v]
    weight = {"S": 4, "A": 3, "B": 2, "C": 1}  # Red's reading, not the team's
    weights = {a: sum(weight[g] for g in v.values()) for a, v in APR23.items()}
    unused_cols = [c for c in COLUMNS_APR23 if not any(c in v for v in APR23.values())]
    print("Stat matrix")
    print(f"  columns: {COLUMNS_MAR18} on Mar 18 -> {len(COLUMNS_APR23)} on Apr 23")
    print(f"  graded cells: {total_mar} -> {total_apr} (kept {kept}, dropped {dropped}, added {added})")
    print(f"  attributes with no effect on Mar 18: {len(idle_mar)} {idle_mar}")
    print(f"  per attribute Mar18 -> Apr23: " + ", ".join(f"{a} {len(MAR18[a])}->{len(APR23[a])}" for a in APR23))
    print(f"  weight (S4 A3 B2 C1): {weights}")
    print(f"  columns no attribute touches: {unused_cols}")

# --- Live Ops 1yr plan: one row per release
RELEASES = [
    # name, monsters, minutes per hunt, success rate, rare drop chance, rare items per crafted item, rare items per monster, share a player wants
    ("Base Game", 20, 25, F(7, 10), F(1, 10), 2, 8, F(1, 2)),
    ("Hard Planets DLC", 3, 35, F(4, 10), F(1, 10), 1, 8, F(7, 10)),
    ("Monster Invasion DLC", 12, 18, F(7, 10), F(2, 10), 3, 8, F(4, 10)),
    ("Dungeon Bosses DLC", 5, 32, F(35, 100), F(75, 1000), 2, 8, F(85, 100)),
    ("Android Aliens Return DLC", 10, 20, F(8, 10), F(1, 10), 2, 8, F(4, 10)),
]
SHEET_ALL = [1920, 2280, 864, 1680, 800]       # column Q as the sheet computes it
SHEET_CUMULATIVE = [1920, 4200, 5064, 6744, 7544]

def grind_report():
    print("Grind model")
    cum_all = cum_want = 0
    for (name, monsters, minutes, success, drop, need, per_monster, want), sheet in zip(RELEASES, SHEET_ALL):
        per_drop = math.ceil(minutes / (success * drop * 60))   # ROUNDUP(H/(I*J*60),0)
        per_item = per_drop * need
        per_set = per_item * per_monster
        all_items = per_set * monsters
        wanted = all_items * want
        cum_all += all_items; cum_want += wanted
        flag = "" if all_items == sheet else f"   <- sheet says {sheet}: adds the base game's 1920 h again"
        print(f"  {name:26s} {per_drop:>3} h/drop  {per_item:>3} h/item  {per_set:>4} h/monster  all {all_items:>5} h  wanted {float(wanted):>7.1f} h{flag}")
    print(f"  year-one total, all rare items: {cum_all} h (sheet's running total: {SHEET_CUMULATIVE[-1]} h)")
    print(f"  year-one total, what a typical player wants: {float(cum_want):.1f} h")
    base_wanted = 960
    print(f"  base game wanted {base_wanted} h = {base_wanted/24:.0f} days nonstop = {base_wanted/2:.0f} days at 2 h a day (~{base_wanted/2/30.4:.1f} months)")

# --- Progression: EXP needed to reach each level (1..30)
EXP = [800, 1500, 2200, 3000, 4000, 5200, 6600, 8000, 10000, 12500, 16000, 20000, 25000, 32000, 40000,
       50000, 62000, 75000, 90000, 108000, 130000, 155000, 187000, 222000, 260000, 310000, 400000,
       550000, 800000, 1300000]

def level_report():
    total = sum(EXP)
    sp = [5 if lvl % 5 == 0 else 2 for lvl in range(1, 31)]
    print("Level curve")
    print(f"  total EXP: {total:,}; attribute points: {len(EXP)}; skill points: {sum(sp)}")
    print(f"  levels 1-20: {sum(EXP[:20]):,} ({sum(EXP[:20])/total:.1%}); levels 21-30: {sum(EXP[20:]):,} ({sum(EXP[20:])/total:.1%})")
    print(f"  levels 27-30: {sum(EXP[26:]):,} ({sum(EXP[26:])/total:.1%}); level 30 alone: {EXP[-1]/total:.1%}")

# --- Weapon Stats: DPS = shots per minute * damage / 60 * bullets per shot
WEAPONS = [
    ("Auto 01", "Auto Rifle", "Primary", 21, 600, 1, "Metal Plating"), ("Auto 02", "Auto Rifle", "Primary", 29, 450, 1, "Metal Plating"),
    ("Auto 03", "Auto Rifle", "Primary", 18, 720, 1, "Metal Plating"), ("Auto 04", "Auto Rifle", "Primary", 33, 360, 1, "Metal Plating"),
    ("Auto 05", "Auto Rifle", "Primary", 33, 360, 1, "Liquid Metal"),
    ("Burst 01", "Burst Rifle", "Primary", 35, 108, 3, "Metal Plating"), ("Burst 02", "Burst Rifle", "Primary", 29, 130, 3, "Metal Plating"),
    ("Burst 03", "Burst Rifle", "Primary", 23, 180, 3, "Metal Plating"), ("Burst 04", "Burst Rifle", "Primary", 35, 110, 4, "Metal Plating"),
    ("Burst 05", "Burst Rifle", "Primary", 33, 360, 5, "Irridium"),
    *[(f"Pistols 0{i}", "Dual Pistols", "Primary", 33, 360, 2, "Metal Plating" if i < 5 else "Bio Spores") for i in range(1, 6)],
    ("Sniper 01", "Sniper Rifle", "Special", 240, 140, 1, "Metal Plating"), ("Sniper 02", "Sniper Rifle", "Special", 320, 90, 1, "Metal Plating"),
    ("Sniper 03", "Sniper Rifle", "Special", 400, 72, 1, "Metal Plating"), ("Sniper 04", "Sniper Rifle", "Special", 400, 72, 1, "Metal Plating"),
    ("Sniper 05", "Sniper Rifle", "Special", 400, 72, 1, "Bio Spores"),
    ("Shotgun 01", "Shotgun", "Special", 27, 80, 12, "Metal Plating"), ("Shotgun 02", "Shotgun", "Special", 12, 240, 12, "Metal Plating"),
    ("Shotgun 03", "Shotgun", "Special", 18, 140, 8, "Metal Plating"), ("Shotgun 04", "Shotgun", "Special", 200, 120, 1, "Metal Plating"),
    ("Shotgun 05", "Shotgun", "Special", 22, 80, 12, "Timber"),
    *[(f"Rocket 0{i}", "Rocket Launcher", "Heavy", 2400, 20, 1, "Metal Plating" if i < 5 else "Fungal Spores") for i in range(1, 6)],
]
REFINED = ["Liquid Metals", "Metal Plating", "Carbon Fiber", "Timber", "Irridium", "Calcium", "Granite", "Silver", "Titanium", "Bio Spores", "Fungal Spores"]

def weapon_report():
    print("Weapons")
    by_type = {}
    for name, kind, ammo, dmg, spm, bullets, mat in WEAPONS:
        dps = F(spm * dmg * bullets, 60)
        by_type.setdefault(kind, []).append((name, float(dps)))
    for kind, rows in by_type.items():
        vals = [v for _, v in rows]
        print(f"  {kind:15s} {min(vals):7.1f} - {max(vals):7.1f}  " + ", ".join(f"{n.split()[-1]}:{v:g}" for n, v in rows))
    used = {("Liquid Metals" if m == "Liquid Metal" else m) for *_, m in WEAPONS}
    print(f"  refined materials a gun uses: {sorted(used)}; unused: {[r for r in REFINED if r not in used]}")
    print(f"  guns upgraded with Metal Plating: {sum(1 for *_, m in WEAPONS if m == 'Metal Plating')} of {len(WEAPONS)}")

# --- Premium currency packs in the prototype (Figma frame 1688:1902) and the pass price (1437:409)
PACKS = [(500, 0, 4.99), (1200, 100, 9.99), (2500, 300, 19.99)]

def store_report():
    print("Store")
    for base, bonus, usd in PACKS:
        print(f"  {base}+{bonus} for ${usd}: {(base + bonus) / usd:.0f} per dollar")
    print("  battle pass: 1,200 (labelled Crystals); the $9.99 pack is the smallest single purchase that covers it")

if __name__ == "__main__":
    matrix_report(); grind_report(); level_report(); weapon_report(); store_report()
