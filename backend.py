def main(image_path):
    """
    Main function to integrate all steps.
    """
    try:
        # Step 1: Scan image
        scanned_image = scan_image(image_path)

        # Step 2: Process the image
        processed_image = process_image(scanned_image)

        # Step 3: Perform OCR (Choose one OCR method)
        # extracted_text = perform_ocr(processed_image)  # Original Tesseract OCR
        # extracted_text = perform_ocr_with_google_vision(image_path)  # Google Vision OCR
        # extracted_text = perform_ocr_with_aws_textract(image_path)  # AWS Textract OCR
        extracted_text = perform_ocr_with_easyocr(image_path)  # EasyOCR OCR

        # Step 4: Post-process the text
        final_text = post_process_text(extracted_text)

        # Display final output
        print("\n--- Extracted Text ---")
        print(final_text)
        print("\nProcess completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
