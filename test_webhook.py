import urllib.request
import json

url = "https://script.google.com/macros/s/AKfycbxToQaJKY739ByNJNwgxk0QcDIkLHNnN0LOT3TIR-CkvJfZGLkyuc-4k1NwrB501fM/exec"

data = {
    "dateString": "30/09/2026",
    "collectorName": "AMBILI",
    "collectorMob": "9526253303",
    "ward": "1",
    "customerId": "20067607370",
    "customerName": "Aasya",
    "customerType": "House",
    "door": "321/A",
    "building": "Aasya",
    "status": "PAID",
    "amount": 50,
    "wasteStatus": "collected",
    "payMode": "cash",
    "remarks": "System Test Integration",
    "phone": "97*******688",
    "qr": "PPY-0000969"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        res_body = response.read().decode('utf-8')
        print("Response:", res_body)
except Exception as e:
    print("Error:", e)
