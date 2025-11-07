let originalImage = null;
let originalFile = null;
let bulkFiles = [];
let selectedPassportSize = "2x2";

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current button and content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Reset all forms when switching tabs
            resetAllConverters();
        });
    });

    // Single image events
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('qualitySlider').addEventListener('input', updateQualityValue);
    document.getElementById('sizeSelect').addEventListener('change', toggleCustomSize);
    document.getElementById('sizeControlType').addEventListener('change', updateSizeControl);
    document.getElementById('uploadArea').addEventListener('dragover', handleDragOver);
    document.getElementById('uploadArea').addEventListener('drop', handleDrop);

    // Bulk processing events
    document.getElementById('bulkFileInput').addEventListener('change', handleBulkFileSelect);
    document.getElementById('bulkUploadArea').addEventListener('dragover', handleBulkDragOver);
    document.getElementById('bulkUploadArea').addEventListener('drop', handleBulkDrop);

    // Passport photo events
    document.getElementById('passportFileInput').addEventListener('change', handlePassportFileSelect);
    document.getElementById('passportUploadArea').addEventListener('dragover', handlePassportDragOver);
    document.getElementById('passportUploadArea').addEventListener('drop', handlePassportDrop);

    // Passport size selection
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedPassportSize = this.getAttribute('data-size');
        });
    });

    // Initialize
    updateQualityValue();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// Single Image Functions
function updateQualityValue() {
    document.getElementById('qualityValue').textContent = 
        document.getElementById('qualitySlider').value + '%';
}

function toggleCustomSize() {
    const customSizeInput = document.getElementById('customSize');
    customSizeInput.style.display = 
        document.getElementById('sizeSelect').value === 'custom' ? 'block' : 'none';
}

function updateSizeControl() {
    const type = document.getElementById('sizeControlType').value;
    const sizeSelect = document.getElementById('sizeSelect');
    
    if (type === 'compress') {
        sizeSelect.innerHTML = `
            <option value="20">20 KB (Maximum Compression)</option>
            <option value="50">50 KB (High Compression)</option>
            <option value="100">100 KB (Good Compression)</option>
            <option value="200">200 KB (Medium Compression)</option>
            <option value="custom">Custom Size</option>
        `;
    } else if (type === 'increase') {
        sizeSelect.innerHTML = `
            <option value="500">500 KB (Small Increase)</option>
            <option value="1000">1 MB (Medium Increase)</option>
            <option value="2000">2 MB (Large Increase)</option>
            <option value="5000">5 MB (Maximum Increase)</option>
            <option value="custom">Custom Size</option>
        `;
    } else {
        sizeSelect.innerHTML = `
            <option value="20">20 KB (Document Use)</option>
            <option value="50">50 KB (Small Size)</option>
            <option value="100">100 KB (Medium Size)</option>
            <option value="500">500 KB (Good Quality)</option>
            <option value="1000">1 MB (High Quality)</option>
            <option value="2000">2 MB (Maximum Quality)</option>
            <option value="custom">Custom Size</option>
        `;
    }
}

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

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
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

function convertImage() {
    if (!originalImage) {
        alert('Pehle koi image upload karein!');
        return;
    }

    const format = document.getElementById('formatSelect').value;
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    const sizeControlType = document.getElementById('sizeControlType').value;
    
    let targetSizeKB = document.getElementById('sizeSelect').value === 'custom' ? 
        parseInt(document.getElementById('customSize').value) : 
        parseInt(document.getElementById('sizeSelect').value);

    const unit = document.getElementById('unitSelect').value;
    const width = document.getElementById('widthInput').value;
    const height = document.getElementById('heightInput').value;
    const maintainAspect = document.getElementById('maintainAspect').checked;

    let finalWidth = width ? parseInt(width) : originalImage.width;
    let finalHeight = height ? parseInt(height) : originalImage.height;

    // Convert units to pixels
    if (width || height) {
        const conversionRate = getConversionRate(unit);
        if (width) finalWidth = Math.round(finalWidth * conversionRate);
        if (height) finalHeight = Math.round(finalHeight * conversionRate);
    }

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

    // Handle size control
    let dataURL;
    if (sizeControlType === 'target' || sizeControlType === 'compress') {
        dataURL = compressToTargetSize(canvas, mimeType, targetSizeKB);
    } else if (sizeControlType === 'increase') {
        dataURL = increaseToTargetSize(canvas, mimeType, targetSizeKB);
    } else {
        dataURL = canvas.toDataURL(mimeType, quality);
    }
    
    // Show converted image
    showConvertedImage(dataURL, finalWidth, finalHeight, fileExtension);
}

function getConversionRate(unit) {
    switch(unit) {
        case 'in': return 96; // 96 DPI
        case 'cm': return 37.8; // 96 / 2.54
        case 'mm': return 3.78; // 96 / 25.4
        default: return 1; // pixels
    }
}

function compressToTargetSize(canvas, mimeType, targetSizeKB) {
    let quality = 0.9;
    let dataURL;
    let iterations = 0;
    const maxIterations = 20;
    
    do {
        dataURL = canvas.toDataURL(mimeType, quality);
        const sizeKB = (dataURL.length * 0.75) / 1024;
        
        if (sizeKB <= targetSizeKB || quality <= 0.1 || iterations >= maxIterations) {
            break;
        }
        
        quality -= 0.1;
        iterations++;
    } while (true);
    
    return dataURL;
}

function increaseToTargetSize(canvas, mimeType, targetSizeKB) {
    let quality = 0.1;
    let dataURL;
    let iterations = 0;
    const maxIterations = 50;
    const originalSize = (canvas.toDataURL(mimeType, 1).length * 0.75) / 1024;
    
    // If original is already larger, return as is
    if (originalSize >= targetSizeKB) {
        return canvas.toDataURL(mimeType, 1);
    }
    
    do {
        quality += 0.02;
        dataURL = canvas.toDataURL(mimeType, quality);
        const sizeKB = (dataURL.length * 0.75) / 1024;
        
        if (sizeKB >= targetSizeKB || quality >= 1 || iterations >= maxIterations) {
            break;
        }
        
        iterations++;
    } while (true);
    
    return dataURL;
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
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

// Bulk Processing Functions
function handleBulkDragOver(e) {
    e.preventDefault();
    document.getElementById('bulkUploadArea').classList.add('dragover');
}

function handleBulkDrop(e) {
    e.preventDefault();
    document.getElementById('bulkUploadArea').classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files).slice(0, 10);
    if (files.length > 0) {
        handleBulkFiles(files);
    }
}

function handleBulkFileSelect(e) {
    const files = Array.from(e.target.files).slice(0, 10);
    if (files.length > 0) {
        handleBulkFiles(files);
    }
}

function handleBulkFiles(files) {
    bulkFiles = [];
    const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} image nahi hai!`);
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} 10 MB se bada hai!`);
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) return;

    bulkFiles = validFiles;
    showBulkFilesPreview();
    document.getElementById('bulkOptions').style.display = 'block';
    document.getElementById('bulkUploadArea').style.display = 'none';
}

function showBulkFilesPreview() {
    const filesList = document.getElementById('bulkFilesList');
    filesList.innerHTML = '';
    
    bulkFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileItem = document.createElement('div');
            fileItem.className = 'bulk-file-item';
            fileItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <div class="file-name">${file.name}</div>
                <small>${(file.size / 1024).toFixed(2)} KB</small>
            `;
            filesList.appendChild(fileItem);
        };
        reader.readAsDataURL(file);
    });
}

function processBulkImages() {
    if (bulkFiles.length === 0) {
        alert('Pehle kuch images upload karein!');
        return;
    }

    const format = document.getElementById('bulkFormatSelect').value;
    const targetSize = parseInt(document.getElementById('bulkTargetSize').value);
    const bulkWidth = document.getElementById('bulkWidth').value;
    
    const downloadArea = document.getElementById('bulkDownloadArea');
    downloadArea.innerHTML = '<p>Processing images... <i class="fas fa-spinner fa-spin"></i></p>';
    document.getElementById('bulkResults').style.display = 'block';

    setTimeout(() => {
        downloadArea.innerHTML = '';
        
        bulkFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (bulkWidth) {
                        const ratio = img.height / img.width;
                        width = parseInt(bulkWidth);
                        height = Math.round(width * ratio);
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
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
                    
                    const dataURL = compressToTargetSize(canvas, mimeType, targetSize);
                    const fileName = file.name.split('.')[0] + '-converted.' + fileExtension;
                    
                    const downloadItem = document.createElement('div');
                    downloadItem.className = 'bulk-download-item';
                    downloadItem.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 8px; margin: 5px 0;">
                            <span>${fileName}</span>
                            <a href="${dataURL}" download="${fileName}" class="download-btn" style="padding: 5px 10px; font-size: 0.9rem;">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>
                    `;
                    downloadArea.appendChild(downloadItem);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }, 1000);
}

// Passport Photo Functions
function handlePassportDragOver(e) {
    e.preventDefault();
    document.getElementById('passportUploadArea').classList.add('dragover');
}

function handlePassportDrop(e) {
    e.preventDefault();
    document.getElementById('passportUploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handlePassportFile(files[0]);
    }
}

function handlePassportFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handlePassportFile(file);
    }
}

function handlePassportFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Kripya sirf image files upload karein!');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size 10 MB se kam honi chahiye!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('passportOptions').style.display = 'block';
        document.getElementById('passportUploadArea').style.display = 'none';
        originalFile = file;
        originalImage = new Image();
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function createPassportPhoto() {
    if (!originalImage) {
        alert('Pehle koi image upload karein!');
        return;
    }

    // Get dimensions based on selected size (in inches)
    let widthIn, heightIn;
    switch(selectedPassportSize) {
        case '2x2':
            widthIn = 2; heightIn = 2;
            break;
        case '2x3':
            widthIn = 2; heightIn = 3;
            break;
        case '3x4':
            widthIn = 3; heightIn = 4;
            break;
        case '4x6':
            widthIn = 4; heightIn = 6;
            break;
        default:
            widthIn = 2; heightIn = 2;
    }

    // Convert inches to pixels (300 DPI for print quality)
    const dpi = 300;
    const widthPx = Math.round(widthIn * dpi);
    const heightPx = Math.round(heightIn * dpi);

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, widthPx, heightPx);
    
    // Calculate dimensions to fit image while maintaining aspect ratio
    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = widthPx / heightPx;
    
    let renderableHeight, renderableWidth, xStart, yStart;
    
    if (imgAspect > canvasAspect) {
        renderableWidth = widthPx;
        renderableHeight = widthPx / imgAspect;
        xStart = 0;
        yStart = (heightPx - renderableHeight) / 2;
    } else {
        renderableHeight = heightPx;
        renderableWidth = heightPx * imgAspect;
        xStart = (widthPx - renderableWidth) / 2;
        yStart = 0;
    }
    
    ctx.drawImage(originalImage, xStart, yStart, renderableWidth, renderableHeight);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    
    // Show result
    const passportOutput = document.getElementById('passportOutput');
    const passportInfo = document.getElementById('passportInfo');
    const passportDownloadBtn = document.getElementById('passportDownloadBtn');
    const passportPreview = document.getElementById('passportPreview');
    
    passportOutput.src = dataURL;
    passportInfo.textContent = `Size: ${widthIn}x${heightIn} inches | Dimensions: ${widthPx}x${heightPx} px | 300 DPI`;
    
    passportDownloadBtn.href = dataURL;
    passportDownloadBtn.download = `passport-photo-${selectedPassportSize}.jpg`;
    passportDownloadBtn.textContent = `📥 Passport Photo Download Karein`;
    
    passportPreview.style.display = 'block';
    passportPreview.scrollIntoView({ behavior: 'smooth' });
}

// Tool Functions
function showBackgroundTool() {
    alert('Background remove tool - Yeh feature advanced image processing require karta hai. Future update mein add karenge.');
}

function showBlurTool() {
    alert('Background blur tool - Yeh feature future update mein add karenge.');
}

function showPdfTool() {
    alert('Image to PDF tool - Yeh feature future update mein add karenge.');
}

function convertToPdf() {
    alert('PDF creation tool - Yeh feature future update mein add karenge.');
}

// Reset Functions
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
    document.getElementById('sizeControlType').value = 'target';
    
    updateQualityValue();
}

function resetBulkConverter() {
    bulkFiles = [];
    document.getElementById('bulkOptions').style.display = 'none';
    document.getElementById('bulkResults').style.display = 'none';
    document.getElementById('bulkUploadArea').style.display = 'block';
    document.getElementById('bulkFileInput').value = '';
    document.getElementById('bulkFilesList').innerHTML = '';
    document.getElementById('bulkDownloadArea').innerHTML = '';
}

function resetPassportConverter() {
    originalImage = null;
    originalFile = null;
    document.getElementById('passportOptions').style.display = 'none';
    document.getElementById('passportPreview').style.display = 'none';
    document.getElementById('passportUploadArea').style.display = 'block';
    document.getElementById('passportFileInput').value = '';
    
    // Reset size selection
    document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('.size-option').classList.add('active');
    selectedPassportSize = "2x2";
}

function resetAllConverters() {
    resetConverter();
    resetBulkConverter();
    resetPassportConverter();
    
    // Hide all tool interfaces
    document.querySelectorAll('.tool-interface').forEach(tool => {
        tool.style.display = 'none';
    });
}