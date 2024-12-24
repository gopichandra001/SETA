let video = document.getElementById('camera');
let flip = document.getElementById('flip-camera');
let capture = document.getElementById('capture');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let currentStream = null;
let useFrontCamera = true;

async function startCamera() {
    // Stop any existing streams
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Define camera constraints
        let constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : 'environment',
                width: { ideal: 1280 }, // Higher resolution for better image quality
                height: { ideal: 720 }
            }
        };

        // Request camera access
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        video.play();

    } catch (error) {
        console.error('Error accessing the camera:', error);
        alert('Camera access failed. Please ensure permissions are granted and your device supports camera functionality.');
    }
}

// Flip between front and back cameras
flip.addEventListener('click', () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
});

// Capture and process the image
capture.addEventListener('click', () => {
    if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a base64 image
        const imageData = canvas.toDataURL('image/png');

        // Display the image in the console for debugging
        console.log("Captured Image:", imageData);

        // Upload the image for OCR processing
        uploadImage(imageData);
    } else {
        alert("Unable to capture the image. Please try again.");
    }
});

// Upload the captured image to the server for processing
function uploadImage(imageData) {
    fetch('/upload', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('extracted-text').value = data.extracted_text || 'No text detected.';
        })
        .catch(error => {
            console.error('Error uploading the image:', error);
            alert('Error processing the image. Please try again.');
        });
}

// Initialize the camera on page load
window.onload = startCamera;
