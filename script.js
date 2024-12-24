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

        // Define camera constraints
        const constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : { exact: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Request camera access
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        video.play();
        console.log("Camera started successfully.");
    } catch (error) {
        console.error("Error starting camera:", error);
        if (error.name === "NotAllowedError") {
            alert("Camera access denied. Please allow camera access.");
        } else if (error.name === "NotFoundError") {
            alert("No camera found on this device.");
        } else {
            alert("Unable to access the camera. Check your device settings.");
        }
    }
}

// Flip camera functionality
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
        const imageData = canvas.toDataURL('image/png');
        console.log("Captured Image:", imageData);

        // Optionally send imageData for processing
        uploadImage(imageData);
    } else {
        alert("Unable to capture the image. Please try again.");
    }
});

// Upload captured image
function uploadImage(imageData) {
    fetch('/upload', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Image processed successfully:", data);
        })
        .catch(error => {
            console.error("Error uploading the image:", error);
        });
}

// Start camera on page load
window.onload = startCamera;
