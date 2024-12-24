from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import base64
import io

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        # Get image from request
        data = request.json.get("image")
        if not data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode base64 image
        image_data = base64.b64decode(data.split(",")[1])
        image = Image.open(io.BytesIO(image_data))

        # Perform OCR
        text = pytesseract.image_to_string(image)
        return jsonify({"extracted_text": text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
