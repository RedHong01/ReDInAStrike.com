# Shroom Pot Showdown playtest tallies. Answer columns transcribed row by row from the
# team response sheets "Shroom Pot Showdown3.0 (Responses)" (Drive 1ZLGN2Sj…, 18 rows,
# 2026-03-22) and "Shroom Pot Showdown4.0 (Responses)" (Drive 1vKeqfs2…, 21 rows,
# 2026-04-05 → 04-22). Run it to re-derive every count on the /shroom-pot-showdown page.
import json, collections
# March 22 (3.0): tutorial | understood | ease | responded | stability | grab | fun | hardest | preferred
MAR = [
 ("Very clear","Yes","Very easy","Mostly","Neutral","Mostly clear","Very fun","mushroom","Yoga ball"),
 ("Very clear","Yes","Neutral","Mostly","Neutral","Mostly clear","Very fun","chopsticks","Yoga ball"),
 ("Very clear","Yes","Easy","Mostly","Very stable","Very clear","Very fun","avoid","Yoga ball"),
 ("Somewhat confusing","Mostly","Very difficult","Rarely","Neutral","Not clear at all","Slightly fun","understand","Yoga ball"),
 ("Very clear","Yes","Very easy","Mostly","Mostly stable","Very clear","Fun","boil","Both"),
 ("Very clear","Yes","Easy","Mostly","Mostly stable","Mostly clear","Fun","boil","Yoga ball"),
 ("Mostly clear","Yes","Neutral","Sometimes","Slightly unstable","Mostly clear","Fun","mushroom","Chopsticks"),
 ("Somewhat confusing","Mostly","Neutral","Rarely","Very unstable","Not clear at all","Slightly fun","mushroom","Chopsticks"),
 ("Mostly clear","Yes","Neutral","Sometimes","Slightly unstable","Very clear","Very fun","mushroom","Chopsticks"),
 ("Mostly clear","Yes","Easy","Sometimes","Mostly stable","","Fun","avoid","Chopsticks"),
 ("Mostly clear","Not really","Difficult","Sometimes","Slightly unstable","Mostly clear","Neutral","understand","Both"),
 ("Mostly clear","Mostly","Very easy","Mostly","Neutral","Mostly clear","Fun","chopsticks","Both"),
 ("Mostly clear","Yes","Very easy","Mostly","Neutral","Very clear","Fun","mushroom","Chopsticks"),
 ("Very clear","Yes","Neutral","Sometimes","Neutral","Mostly clear","Neutral","avoid","Both"),
 ("Mostly clear","Yes","Easy","Mostly","Neutral","Very clear","Fun","mushroom","Both"),
 ("Very clear","Yes","Easy","Sometimes","Mostly stable","Mostly clear","Very fun","other","Both"),
 ("Mostly clear","Mostly","Neutral","Sometimes","Neutral","Slightly clear","Fun","mushroom","Yoga ball"),
 ("Very clear","Yes","Very easy","Sometimes","Mostly stable","Slightly clear","Very fun","other","Yoga ball"),
]
# April 5-22 (4.0): understood | ease | responded | stability | grab | preferred | fun | hardest | date
APR = [
 ("Yes","Neutral","Sometimes","Mostly stable","Slightly clear","Yoga ball","Fun","avoid","04-05"),
 ("Yes","Neutral","Sometimes","Slightly unstable","Mostly clear","Both","Fun","avoid","04-05"),
 ("Yes","Easy","Mostly","Neutral","Very clear","Chopsticks","Fun","mushroom","04-15"),
 ("Mostly","Difficult","Sometimes","Mostly stable","Mostly clear","Yoga ball","Neutral","chopsticks","04-15"),
 ("Yes","Easy","Mostly","Very stable","Not clear at all","Yoga ball","Fun","mushroom","04-15"),
 ("Not really","Difficult","Sometimes","Neutral","Not clear at all","Yoga ball","Neutral","mushroom","04-15"),
 ("Yes","Neutral","Sometimes","Very stable","Mostly clear","Both","Very fun","chopsticks","04-15"),
 ("Yes","Difficult","Sometimes","Very unstable","Slightly clear","Yoga ball","Fun","chopsticks","04-15"),
 ("Mostly","Difficult","Rarely","Slightly unstable","Slightly clear","Yoga ball","Neutral","mushroom","04-15"),
 ("Yes","Neutral","Rarely","Neutral","Not clear at all","Yoga ball","Fun","avoid","04-15"),
 ("Mostly","Easy","Mostly","Neutral","Mostly clear","Chopsticks","Very fun","mushroom","04-15"),
 ("Yes","Neutral","Mostly","Mostly stable","Very clear","Yoga ball","Very fun","boil","04-15"),
 ("Yes","Very easy","Sometimes","Mostly stable","Very clear","Both","Fun","chopsticks","04-15"),
 ("Mostly","Easy","Always","Very stable","Mostly clear","Yoga ball","Fun","boil","04-15"),
 ("Yes","Easy","Sometimes","Neutral","Very clear","Both","Very fun","mushroom","04-15"),
 ("Mostly","Neutral","Sometimes","Neutral","Mostly clear","Chopsticks","Fun","mushroom","04-15"),
 ("Yes","Difficult","Sometimes","Mostly stable","Mostly clear","Yoga ball","Very fun","mushroom","04-15"),
 ("Yes","Easy","Rarely","Slightly unstable","Mostly clear","Chopsticks","Very fun","mushroom","04-15"),
 ("Mostly","Easy","Sometimes","Neutral","Very clear","Chopsticks","Fun","mushroom","04-15"),
 ("Yes","Neutral","Mostly","Very stable","","","Fun","mushroom","04-15"),
 ("Mostly","Neutral","Sometimes","Slightly unstable","","","Fun","mushroom","04-22"),
]
assert len(MAR) == 18 and len(APR) == 21
def tally(rows, i): return collections.Counter(r[i] for r in rows)
m = {k: tally(MAR, i) for i, k in enumerate(["tutorial","understood","ease","responded","stability","grab","fun","hardest","preferred"])}
a = {k: tally(APR, i) for i, k in enumerate(["understood","ease","responded","stability","grab","preferred","fun","hardest","date"])}
for k in ["understood","ease","responded","stability","grab","fun","hardest","preferred"]:
    print(f"{k:11s} MAR {dict(m[k])}")
    print(f"{'':11s} APR {dict(a[k])}")
print("tutorial   MAR", dict(m["tutorial"]))
print("April dates", dict(a["date"]))

