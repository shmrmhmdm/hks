import csv
import json
import re

customers = []
with open('sample_data.csv', mode='r', encoding='utf-8', errors='ignore') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if not row or len(row) < 10:
            continue
        # header: ['', 'Customer Number', 'Customer Name', 'Mobile Number', 'QR Code', 'Building Name', 'Door Number', 'Address', 'Customer Type', 'Ward']
        c_num = row[1].strip()
        c_name = row[2].strip()
        c_phone = row[3].strip()
        c_qr = row[4].strip()
        c_bldg = row[5].strip()
        c_door = row[6].strip()
        c_addr = row[7].strip()
        c_type = row[8].strip()
        c_ward = row[9].strip()
        
        if not c_name and not c_num and not c_qr:
            continue
            
        customers.append({
            "id": c_num,
            "name": c_name,
            "phone": c_phone,
            "qr": c_qr,
            "building": c_bldg,
            "door": c_door,
            "address": c_addr.replace('\n', ', '),
            "type": c_type if c_type else "House",
            "ward": int(c_ward) if c_ward.isdigit() else c_ward,
            "rate": 50 if c_type.lower() == "house" else 100
        })

print(f"Processed {len(customers)} customers.")
with open('customers.json', 'w', encoding='utf-8') as out:
    json.dump(customers, out, ensure_ascii=False)
print("Saved to customers.json")
