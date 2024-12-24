import cv2
from PIL import Image
import numpy as np
import pytesseract

def enhance_image(image_path):
    # Load the image
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Apply binarization
    _, binary_image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Deskew the image
    coords = np.column_stack(np.where(binary_image > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = binary_image.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    deskewed_image = cv2.warpAffine(binary_image, rotation_matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Remove noise and speckles
    cleaned_image = cv2.fastNlMeansDenoising(deskewed_image, None, 30, 7, 21)

    # Save the enhanced image temporarily
    enhanced_path = "enhanced_image.png"
    cv2.imwrite(enhanced_path, cleaned_image)
    return enhanced_path

def extract_text(image_path):
    enhanced_image_path = enhance_image(image_path)
    img = Image.open(enhanced_image_path)
    text = pytesseract.image_to_string(img)
    return text
