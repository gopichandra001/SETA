import easyocr
from PIL import Image

# Load the image
image_path = "image.png"  # Replace with the correct path to your image

# Initialize EasyOCR Reader
reader = easyocr.Reader(['en'])

# Perform OCR on the image
results = reader.readtext(image_path)

# Print raw text from the image
print("Extracted Text:")
for result in results:
    print(result[1])  # Printing only the text part
