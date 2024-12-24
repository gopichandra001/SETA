import cv2
import numpy as np
import subprocess
import os


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

    # Binarization (convert to black and white)
    _, binarized = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)

    # Deskewing (straightening skewed text)
    coords = np.column_stack(np.where(binarized > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = binarized.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    deskewed = cv2.warpAffine(binarized, rotation_matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    print("Deskewing applied.")

    # Despeckling (removing noise)
    despeckled = cv2.medianBlur(deskewed, 3)
    print("Despeckling applied.")

    return despeckled


def perform_ocr_with_ocrmypdf(image_path, output_pdf="output.pdf"):
    """
    Performs OCR using OCRmyPDF.
    """
    print("Step 3: Performing OCR with OCRmyPDF...")

    # Temporary output path for the OCR-ed PDF
    ocr_command = [
        "ocrmypdf",
        "--force-ocr",
        image_path,
        output_pdf
    ]
    
    # Run the OCR process
    try:
        subprocess.run(ocr_command, check=True)
        print(f"OCR completed successfully. Output saved to {output_pdf}")
        
        # Read the text from the output PDF using pdftotext (optional)
        extracted_text = subprocess.check_output(["pdftotext", output_pdf, "-"]).decode('utf-8')
        return extracted_text.strip()
    except subprocess.CalledProcessError as e:
        raise Exception(f"OCRmyPDF failed with error: {e}")


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

        # Step 3: Perform OCR with OCRmyPDF
        extracted_text = perform_ocr_with_ocrmypdf(processed_image_path)

        # Step 4: Post-process the text
        final_text = post_process_text(extracted_text)

        # Display final output
        print("\n--- Extracted Text ---")
        print(final_text)
        print("\nProcess completed successfully.")

        # Clean up temporary files
        os.remove(processed_image_path)

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    # Update the path below with the path to your image
    image_path = "scanned_document.jpg"
    main(image_path)
