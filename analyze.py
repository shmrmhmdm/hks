import csv
import json

with open('sample_data.csv', mode='r', encoding='utf-8', errors='ignore') as f:
    reader = csv.reader(f)
    header = next(reader)
    print("Header:", header)
    wards = set()
    types = set()
    count = 0
    sample_rows = []
    for row in reader:
        count += 1
        if count <= 5:
            sample_rows.append(row)
        if len(row) > 9:
            wards.add(row[9].strip())
            types.add(row[8].strip())

print(f"Total records: {count}")
print(f"Unique wards ({len(wards)}): {sorted(list(wards))}")
print(f"Customer types: {types}")
print("Sample rows:")
for r in sample_rows:
    print(r)
