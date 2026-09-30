import csv
import json

members = []
with open('hks_sheet.csv', mode='r', encoding='utf-8', errors='ignore') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if not row or len(row) < 2:
            continue
        name = row[0].strip().replace('"', '')
        mob = row[1].strip().replace('"', '')
        if name:
            members.append({"name": name, "mob": mob})

print(f"Loaded {len(members)} HKS members.")
with open('public/data/hks_members.json', 'w', encoding='utf-8') as out:
    json.dump(members, out, ensure_ascii=False)
print("Saved to public/data/hks_members.json")
