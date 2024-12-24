import cv2
import numpy as np
import subprocess


def scan_image(image_path):
    """
    Reads and preprocesses the image for OCR.
    """
    print("Step 1: Scanning the document...")
    # Load the image
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # Grayscale mode for better OCR
    if image is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    print("Original image loaded successfully.")
    return image


def process_image(image):
    """
    Processes the image for better OCR recognition.
    """
    print("Step 2: Applying image processing techniques...")

    # Resize for better resolution
    resized = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Binarization (convert to black and white)
    _, binarized = cv2.threshold(resized, 127, 255, cv2.THRESH_BINARY)

    # Deskewing (straightening skewed text)
    coords = np.column_stack(np.where(binar
