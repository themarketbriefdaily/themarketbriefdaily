import os
BASE = "/home/runner/work/themarketbriefdaily/themarketbriefdaily"
def w(rel, txt):
    path = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(txt)
    print(f"  {rel}: {txt.count(chr(10))+1} lines")
