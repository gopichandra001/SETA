let video = document.getElementById('camera');
let flip = document.getElementById('flip-camera');
let capture = document.getElementById('capture');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let currentStream = null;
let useFrontCamera = true;

function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    let constraints = {
        video: {
            facingMode: useFrontCamera ? 'user' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing the camera:', error);
        });
}

flip.addEventListener('click', () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
});

capture.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the image to a higher resolution by scaling up
    let scaledCanvas = document.createElement('canvas');
    let scaledContext = scaledCanvas.getContext('2d');
    let scalingFactor = 2; // Increase resolution by scaling factor
    scaledCanvas.width = canvas.width * scalingFactor;
    scaledCanvas.height = canvas.height * scalingFactor;
    scaledContext.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    const imageData = scaledCanvas.toDataURL('image/png');
    console.log(imageData); // Process the enhanced image further

    // Send the image data for further processing
    uploadImage(imageData);
});

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

window.onload = startCamera;
