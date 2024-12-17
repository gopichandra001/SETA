const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureButton = document.getElementById("captureButton");
const flipCameraBtn = document.getElementById("flipCamera");
const processingText = document.getElementById("processing-text");
const resultDiv = document.getElementById("result");

let facingMode = "environment"; // Default to back camera
let currentStream = null;

// Start the camera
async function startCamera() {
    try {
        if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
            video: {
                facingMode: facingMode,
            },
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (error) {
        console.error("Error accessing the camera:", error);
        alert("Camera access is required for this feature.");
    }
}

// Capture the image and send it to the server
captureButton.addEventListener("click", async () => {
    console.log("Capture button clicked");
    // Draw the video frame onto the canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to Base64
    const imageData = canvas.toDataURL("image/png");
    console.log("Image captured and converted to Base64");

    // Show processing text
    processingText.classList.remove("hidden");

    // Send the image to the server for processing
    await sendImageToServer(imageData);
});

// Flip the camera
flipCameraBtn.addEventListener("click", () => {
    facingMode = facingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Send image to the server
async function sendImageToServer(imageData) {
    console.log("Sending image to server...");
    try {
        const response = await fetch("http://193.186.4.139:5000/extract-text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server error:", errorData);
            throw new Error(errorData.error || "Failed to process the image.");
        }

        const result = await response.json();
        console.log("Extracted text:", result.text);
        displayResult(result.text);
    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    } finally {
        processingText.classList.add("hidden");
    }
}

// Display extracted text
function displayResult(text) {
    resultDiv.innerHTML = `<h3>Extracted Text:</h3><p>${text}</p>`;
}

// Start the camera on page load
startCamera();
