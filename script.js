let originalImage = null;
let originalFile = null;

// Event Listeners
document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('qualitySlider').addEventListener('input', updateQualityValue);
document.getElementById('sizeSelect').addEventListener('change', toggleCustomSize);
document.getElementById('uploadArea').addEventListener('dragover', handleDragOver);
document.getElementById('uploadArea').addEventListener('drop', handleDrop);

// Quality slider update
function updateQualityValue() {
    document.getElementById('qualityValue').textContent = 
        document.getElementById('qualitySlider').value + '%';
}

// Custom size toggle
function toggleCustomSize() {
    const customSizeInput = document.getElementById('customSize');
    customSizeInput.style.display = 
        document.getElementById('sizeSelect').value === 'custom' ? 'block' : 'none';
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
}

// File selection handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
    // File validation
    if (!file.type.startsWith('image/')) {
        alert('Kripya sirf image files upload karein!');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size 10 MB se kam honi chahiye!');
        return;
    }

    originalFile = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            showImagePreview(originalImage, file);
            showOptionsPanel();
        };
        originalImage.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function showImagePreview(image, file) {
    const originalPreview = document.getElementById('originalPreview');
    const originalInfo = document.getElementById('originalInfo');
    
    originalPreview.src = image.src;
    originalInfo.textContent = 
        `Size: ${(file.size / 1024).toFixed(2)} KB | Dimensions: ${image.width}x${image.height} | Format: ${file.type.split('/')[1].toUpperCase()}`;
}

function showOptionsPanel() {
    document.getElementById('optionsPanel').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
}

// Main conversion function
function convertImage() {
    if (!originalImage) {
        alert('Pehle koi image upload karein!');
        return;
    }

    const format = document.getElementById('formatSelect').value;
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    const targetSizeKB = document.getElementById('sizeSelect').value === 'custom' ? 
        parseInt(document.getElementById('customSize').value) : 
        parseInt(document.getElementById('sizeSelect').value);
    
    const width = document.getElementById('widthInput').value || originalImage.width;
    const height = document.getElementById('heightInput').value || originalImage.height;
    const maintainAspect = document.getElementById('maintainAspect').checked;

    let finalWidth = parseInt(width);
    let finalHeight = parseInt(height);

    // Maintain aspect ratio if requested
    if (maintainAspect && (width || height)) {
        const aspectRatio = originalImage.width / originalImage.height;
        if (width && !height) {
            finalHeight = Math.round(finalWidth / aspectRatio);
        } else if (height && !width) {
            finalWidth = Math.round(finalHeight * aspectRatio);
        }
    }

    // Create canvas for conversion
    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, finalWidth, finalHeight);

    // Convert to desired format
    let mimeType = 'image/jpeg';
    let fileExtension = 'jpg';
    
    switch(format) {
        case 'png':
            mimeType = 'image/png';
            fileExtension = 'png';
            break;
        case 'webp':
            mimeType = 'image/webp';
            fileExtension = 'webp';
            break;
    }

    // Convert with quality settings
    const dataURL = canvas.toDataURL(mimeType, quality);
    
    // Show converted image
    showConvertedImage(dataURL, finalWidth, finalHeight, fileExtension);
}

function showConvertedImage(dataURL, width, height, format) {
    const convertedPreview = document.getElementById('convertedPreview');
    const convertedInfo = document.getElementById('convertedInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewSection = document.getElementById('previewSection');

    convertedPreview.src = dataURL;
    
    // Calculate file size
    const fileSizeKB = (dataURL.length * 0.75) / 1024;
    
    convertedInfo.textContent = 
        `Size: ${fileSizeKB.toFixed(2)} KB | Dimensions: ${width}x${height} | Format: ${format.toUpperCase()}`;
    
    // Set download link
    downloadBtn.href = dataURL;
    downloadBtn.download = `converted-image.${format}`;
    downloadBtn.textContent = `📥 Converted Image Download Karein (${fileSizeKB.toFixed(2)} KB)`;
    
    // Show preview section
    previewSection.style.display = 'block';
    
    // Scroll to preview
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

// Reset converter
function resetConverter() {
    originalImage = null;
    originalFile = null;
    
    document.getElementById('optionsPanel').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    
    document.getElementById('fileInput').value = '';
    document.getElementById('widthInput').value = '';
    document.getElementById('heightInput').value = '';
    document.getElementById('qualitySlider').value = 85;
    document.getElementById('sizeSelect').value = '1000';
    document.getElementById('customSize').style.display = 'none';
    
    updateQualityValue();
}

// Auto update year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize
updateQualityValue();