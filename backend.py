import cv2
import numpy as np
from kraken import binarization
from kraken.lib.models import load_any
from kraken.lib import vgsl


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

    # Binarization using Kraken's binarization method
    binarized_image = binarization.nlbin(image)
    print("Binarization applied.")

    # Resize for better OCR performance
    resized_image = cv2.resize(binarized_image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    print("Resizing applied.")

    return resized_image


def perform_ocr_with_kraken(image_path, model_path="en-default"):
    """
    Performs OCR using Kraken OCR.
    """
    print("Step 3: Performing OCR with Kraken OCR...")

    # Load the pre-trained Kraken model
    model = load_any(model_path)

    # Perform OCR
    try:
        result = vgsl.recognize([image_path], model=model)
        extracted_text = "\n".join([line['text'] for line in result])
        print("OCR completed successfully with Kraken.")
        return extracted_text
    except Exception as e:
        raise Exception(f"Kraken OCR failed: {e}")


def post_process_text(extracted_text):
    """
    Post-processes the extracted text for formatting and editing.
    """
    print("Step 4: Post-processing the text...")
    cleaned_text = extracted_text.strip()
    print("Text post-processing completed.")
    return cleaned_text


def main(image_path):
    """
    Main function to integrate all steps.
    """
    try:
        # Step 1: Scan image
        scanned_image = scan_image(image_path)

        # Step 2: Process the image
        processed_image = process_image(scanned_image)

        # Save the processed image temporarily
        processed_image_path = "processed_image.jpg"
        cv2.imwrite(processed_image_path, processed_image)

        # Step 3: Perform OCR with Kraken
        extracted_text = perform_ocr_with_kraken(processed_image_path)

        # Step 4: Post-process the text
        final_text = post_process_text(extracted_text)

        # Display final output
        print("\n--- Extracted Text ---")
        print(final_text)
        print("\nProcess completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    # Update the path below with the path to your image
    image_path = "scanned_document.jpg"
    main(image_path)
