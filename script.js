let video = document.getElementById('camera');
let flip = document.getElementById('flip-camera');
let capture = document.getElementById('capture');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let currentStream = null;
let useFrontCamera = true;

async function startCamera() {
    try {
        // Stop existing streams
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Define constraints for mobile and desktop
        const constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Request user media
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        video.play();
    } catch (error) {
        console.error('Error starting the camera:', error);
        alert('Unable to access the camera. Please check permissions and ensure your device has a camera.');
    }
}

// Flip camera
flip.addEventListener('click', () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
});

// Capture image
capture.addEventListener('click', () => {
    if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to image data
        const imageData = canvas.toDataURL('image/png');
        uploadImage(imageData);
    } else {
        alert("Unable to capture image. Please try again.");
    }
});

// Upload captured image for OCR processing
async function uploadImage(imageData) {
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });
        const result = await response.json();
        document.getElementById('extracted-text').value = result.extracted_text || 'No text detected.';
    } catch (error) {
        console.error("Error uploading the image:", error);
        alert("Error processing the image. Please try again.");
    }
}

// Initialize camera on page load
window.onload = startCamera;
