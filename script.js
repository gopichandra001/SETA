const keywords = [
    "Product name", "Colour", "Motor type", "Frequency", "Gross weight", "Ratio",
    "Motor Frame", "Model", "Speed", "Quantity", "Voltage", "Material", "Type",
    "Horse power", "Consinee", "LOT", "Stage", "Outlet", "Serial number", "Head Size",
    "Delivery size", "Phase", "Size", "MRP", "Use before", "Height",
    "Maximum Discharge Flow", "Discharge Range", "Assembled by", "Manufacture date",
    "Company name", "Customer care number", "Seller Address", "Seller email", "GSTIN",
    "Total amount", "Payment status", "Payment method", "Invoice date", "Warranty", 
    "Brand", "Motor horsepower", "Power", "Motor phase", "Engine type", "Tank capacity",
    "Head", "Usage/Application", "Weight", "Volts", "Hertz", "Frame", "Mounting", "Toll free number",
    "Pipesize", "Manufacturer", "Office", "Size", "Ratio", "SR/Serial number"
];

let currentFacingMode = "environment";
let stream = null;
let extractedData = {};
let allData = [];

// Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const outputDiv = document.getElementById('outputAttributes');

// Start Camera
async function startCamera() {
    try {
        if (stream) stream.getTracks().forEach(track => track.stop());
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode, width: 1280, height: 720 }
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Camera access denied or unavailable.");
        console.error(err);
    }
}

// Flip Camera
document.getElementById('flipButton').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    startCamera();
});

// Capture Image
document.getElementById('captureButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Display the captured image for verification
    canvas.toBlob(blob => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => processImage(img);

        // Uncomment the line below to display the captured image
        // document.body.appendChild(img);
    }, 'image/png');
});

// Process Image with Tesseract.js
async function processImage(img) {
    outputDiv.innerHTML = "<p>Processing...</p>";
    try {
        const result = await Tesseract.recognize(img, 'eng', { logger: m => console.log(m) });

        if (result && result.data.text) {
            console.log("OCR Result:", result.data.text);
            processTextToAttributes(result.data.text);
        } else {
            outputDiv.innerHTML = "<p>No text detected. Please try again.</p>";
        }
    } catch (error) {
        console.error("Tesseract Error:", error);
        outputDiv.innerHTML = "<p>Error processing image. Please try again.</p>";
    }
}

// Map Extracted Text to Keywords
function processTextToAttributes(text) {
    const lines = text.split("\n");
    extractedData = {};
    let unmatchedText = [];

    keywords.forEach(keyword => {
        let found = false;
        for (let line of lines) {
            if (line.includes(keyword)) {
                extractedData[keyword] = line.split(":"[1]?.trim() || "-");
                found = true;
                break;
            }
        }
        if (!found) extractedData[keyword] = "-";
    });

    // If Product Name is missing, assign Brand value to Product Name
    if (!extractedData["Product name"] || extractedData["Product name"] === "-") {
        const brandLine = lines.find(line => line.includes("Brand"));
        if (brandLine) {
            extractedData["Product name"] = brandLine.split(":"[1]?.trim() || "-");
        }
    }

    lines.forEach(line => {
        let isMatched = keywords.some(keyword => line.includes(keyword));
        if (!isMatched) {
            unmatchedText.push(line.trim());
        }
    });

    if (unmatchedText.length > 0) {
        extractedData["Other Specifications"] = unmatchedText.join("; ");
    }

    allData.push(extractedData);
    displayData();
}

// Display Data
function displayData() {
    outputDiv.innerHTML = "";
    Object.entries(extractedData).forEach(([key, value]) => {
        if (value !== "-") {
            outputDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    });
}

// Export to Excel
document.getElementById('exportButton').addEventListener('click', () => {
    const workbook = XLSX.utils.book_new();
    const headers = keywords.concat("Other Specifications");
    const data = allData.map(row => headers.map(key => row[key] || "-"));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, "Camera_Extracted_Data.xlsx");
});

// Start Camera on Load
startCamera();
