import easyocr
import re

# Initialize EasyOCR Reader
reader = easyocr.Reader(['en'])

# Load the image
image_path = "image.png"  # Replace with the correct path to your image

# Perform OCR on the image
results = reader.readtext(image_path)

# Combine all extracted text
extracted_text = "\n".join([result[1] for result in results])
print("Full Extracted Text:")
print(extracted_text)

# Function to extract structured data
def extract_structured_data(text):
    structured_data = {}

    # Patterns for matching the fields
    patterns = {
        "Company Name": r"(?i)(Company Name|Company):\s*(.*)",
        "Address": r"(?i)(Address):\s*(.*)",
        "Phone": r"(?i)(Phone|Contact):\s*(\+?\d{10,15})",
        "GSTIN": r"(?i)(GSTIN):\s*([A-Z0-9]+)",
        "PAN Number": r"(?i)(PAN\s*Number|PAN):\s*([A-Z]{5}[0-9]{4}[A-Z])",
        "Invoice Number": r"(?i)(Invoice\s*Number|Invoice No):\s*(\d+)",
        "Invoice Date": r"(?i)(Invoice\s*Date|Date):\s*(.*)"
    }

    # Match each pattern and extract data
    for field, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            structured_data[field] = match.group(2 if "Company" in field or "Address" in field else 1)
        else:
            structured_data[field] = "-"

    return structured_data

# Extract and print structured data
structured_data = extract_structured_data(extracted_text)

print("\nStructured Data:")
for key, value in structured_data.items():
    print(f"{key}: {value}")
