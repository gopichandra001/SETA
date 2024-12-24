let video = document.getElementById('camera');
let flip = document.getElementById('flip-camera');
let capture = document.getElementById('capture');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let currentStream = null;
let useFrontCamera = true;

function startCamera() {
    // Stop any existing video streams
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    // Define constraints for mobile and desktop compatibility
    let constraints = {
        video: {
            facingMode: useFrontCamera ? 'user' : { ideal: 'environment' },
            width: { ideal: 1280 }, // Adjust for high resolution
            height: { ideal: 720 }
        }
    };

    // Access camera
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(error => {
            console.error('Error accessing the camera:', error);
            alert('Camera access failed. Please ensure permissions are granted.');
        });
}

// Flip camera functionality
flip.addEventListener('click', () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
});

// Capture image functionality
capture.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image as a data URL
    const imageData = canvas.toDataURL('image/png');

    // Send image data for processing
    uploadImage(imageData);
});

// Function to upload the image to the server
function uploadImage(imageData) {
    fetch('/upload', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('extracted-text').value = data.extracted_text;
        })
        .catch(error => console.error('Error uploading the image:', error));
}

// Start the camera on page load
window.onload = startCamera;
