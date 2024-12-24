// Initialize the camera
async function startCamera() {
    const videoElement = document.getElementById("camera");

    try {
        // Request access to the camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false, // Audio not required
        });

        // Set the video element's source to the camera stream
        videoElement.srcObject = stream;
        videoElement.play();
        console.log("Camera started successfully.");
    } catch (error) {
        console.error("Camera Error:", error);

        // Handle common errors
        if (error.name === "NotAllowedError") {
            alert("Camera access is denied. Please allow camera permissions in your browser.");
        } else if (error.name === "NotFoundError") {
            alert("No camera found. Please connect a camera to your device.");
        } else {
            alert("An unexpected error occurred while accessing the camera: " + error.message);
        }
    }
}

// Capture an image and process it
document.getElementById("captureButton").addEventListener("click", () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match the video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => extractText(img);
});

// Extract text using Tesseract.js
async function extractText(image) {
    try {
        document.getElementById("loader").style.display = "block"; // Show loading indicator

        const result = await Tesseract.recognize(image, "eng");
        displayExtractedText(result.data.text); // Display the extracted text
    } catch (error) {
        console.error("Text Extraction Error:", error);
        alert("Failed to extract text. Please try again.");
    } finally {
        document.getElementById("loader").style.display = "none"; // Hide loading indicator
    }
}

// Display extracted text
function displayExtractedText(text) {
    const outputDiv = document.getElementById("outputText");
    outputDiv.textContent = text || "No text found.";
}

// Automatically start the camera when the page loads
document.addEventListener("DOMContentLoaded", startCamera);
