let video = document.getElementById('camera');
let flip = document.getElementById('flip-camera');
let capture = document.getElementById('capture');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let currentStream = null;
let useFrontCamera = true;

async function startCamera() {
    try {
        // Stop any existing streams
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Define constraints for both mobile and webcam
        let constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : 'environment',
                width: { ideal: 1280 }, // Adjust width for higher resolution
                height: { ideal: 720 }
            }
        };

        // Request access to the camera
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        video.play();
    } catch (error) {
        console.error('Error accessing the camera:', error);
        alert('Unable to access the camera. Please ensure camera permissions are granted and try again.');
    }
}

// Flip camera functionality
flip.addEventListener('click', () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
});

// Capture the current video frame
capture.addEventListener('click', () => {
    if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas image to a data URL
        const imageData = canvas.toDataURL('image/png');

        // Display the captured image in the console for debugging
        console.log("Captured Image:", imageData);

        // Upload the image for processing
        uploadImage(imageData);
    } else {
        alert("Unable to capture the image. Please try again.");
    }
});

// Upload the image to the server for OCR processing
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
