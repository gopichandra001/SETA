const BACKEND_ENDPOINT = "http://127.0.0.1:5000/api/push"; // Backend API URL

let extractedData = {}; // Global variable to store extracted data
let currentFacingMode = "environment"; // Default camera mode

// Start the camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode },
            audio: false
        });
        const videoElement = document.getElementById("camera");
        videoElement.srcObject = stream;
        videoElement.play();
    } catch (error) {
        console.error("Error accessing the camera:", error);
        alert("Unable to access the camera. Please check your browser permissions.");
    }
}

// Flip the camera between front and back
document.getElementById("flipButton").addEventListener("click", () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture an image from the video stream and process it
document.getElementById("captureButton").addEventListener("click", () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => processImage(img);
});

// Use Tesseract.js to process the image and extract text
async function processImage(img) {
    try {
        document.getElementById("loader").style.display = "block"; // Show loader
        const result = await Tesseract.recognize(img, "eng");
        mapExtractedData(result.data.text); // Map extracted text to structured data
    } catch (error) {
        alert("Error processing the image. Please try again.");
        console.error("Image processing error:", error);
    } finally {
        document.getElementById("loader").style.display = "none"; // Hide loader
    }
}

// Map extracted text to predefined keywords
function mapExtractedData(text) {
    const keywords = [
        "Product name", "Colour", "Motor type", "Frequency", "Gross weight", "Ratio",
        "Motor Frame", "Model", "Quantity", "Voltage", "Material", "Horse power",
        "Stage", "GSTIN", "Seller Address", "Manufacture date", "Company name",
        "Customer care number", "Total amount", "Other Specifications"
    ];

    const lines = text.split("\n");
    extractedData = {};
    let remainingText = [];

    // Match lines to keywords
    keywords.forEach(keyword => {
        lines.forEach((line, index) => {
            const regex = new RegExp(`${keyword}\\s*[:\\-]?\\s*(.+)`, "i");
            const match = line.match(regex);
            if (match && match[1]) {
                extractedData[keyword] = match[1].trim();
                lines[index] = ""; // Mark line as processed
            }
        });
    });

    // Remaining unmatched text goes into Other Specifications
    remainingText = lines.filter(line => line.trim() !== "");
    extractedData["Other Specifications"] = remainingText.join(" ");

    // Display the extracted data
    displayExtractedData();
}

// Display extracted data on the frontend
function displayExtractedData() {
    const outputDiv = document.getElementById("outputAttributes");
    outputDiv.innerHTML = ""; // Clear previous data
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value) {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Send the extracted data to the backend Flask API
async function sendDataToBackend() {
    try {
        console.log("Sending Data to Backend:", extractedData); // Log data for debugging

        const response = await fetch(BACKEND_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extractedData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Data successfully stored in Salesforce and Excel sheet!");
        } else {
            alert(`Backend error: ${result.error}`);
        }
    } catch (error) {
        alert("Failed to connect to the backend. Please try again.");
        console.error("Backend connection error:", error);
    }
}

// Initialize the camera on page load
document.addEventListener("DOMContentLoaded", startCamera);
