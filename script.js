// (संपूर्ण वही JS जो तुमने दिया था, बस filename small-s रखा गया है)
// Main Application
class SheebuTechApp {
    constructor() {
        this.tools = {
            'image-tools': [
                {
                    id: 'compress',
                    name: 'Image Compression',
                    icon: 'compress',
                    description: 'Compress images to any size (10KB, 20KB, 50KB, etc.) while maintaining quality.',
                    category: 'image'
                },
                {
                    id: 'resize',
                    name: 'Image Resizing',
                    icon: 'expand',
                    description: 'Resize images in pixels, centimeters, millimeters, or inches.',
                    category: 'image'
                },
                {
                    id: 'convert',
                    name: 'Format Conversion',
                    icon: 'sync',
                    description: 'Convert between JPG, PNG, WEBP, GIF formats.',
                    category: 'image'
                },
                {
                    id: 'crop',
                    name: 'Image Cropping',
                    icon: 'crop',
                    description: 'Crop images to exact dimensions with precision.',
                    category: 'image'
                },
                {
                    id: 'watermark',
                    name: 'Watermark Addition',
                    icon: 'tint',
                    description: 'Add text watermarks to your images.',
                    category: 'image'
                },
                {
                    id: 'invert',
                    name: 'Image Inversion',
                    icon: 'exchange-alt',
                    description: 'Invert image colors or flip images.',
                    category: 'image'
                }
            ],
            'pdf-tools': [
                {
                    id: 'merge-pdf',
                    name: 'Merge PDFs',
                    icon: 'object-group',
                    description: 'Combine multiple PDFs into a single document.',
                    category: 'pdf'
                },
                {
                    id: 'split-pdf',
                    name: 'Split PDF',
                    icon: 'cut',
                    description: 'Split PDF by pages, ranges, or size.',
                    category: 'pdf'
                },
                {
                    id: 'compress-pdf',
                    name: 'Compress PDF',
                    icon: 'file-pdf',
                    description: 'Reduce PDF file size while maintaining quality.',
                    category: 'pdf'
                }
            ],
            'ai-tools': [
                {
                    id: 'ai-enhance',
                    name: 'AI Photo Retouching',
                    icon: 'robot',
                    description: 'Automatically enhance photos and remove imperfections.',
                    category: 'ai'
                },
                {
                    id: 'ai-background',
                    name: 'AI Background Removal',
                    icon: 'portrait',
                    description: 'Intelligently remove backgrounds with AI precision.',
                    category: 'ai'
                },
                {
                    id: 'ai-restore',
                    name: 'Old Photo Restoration',
                    icon: 'history',
                    description: 'Restore and colorize old or damaged photos.',
                    category: 'ai'
                }
            ]
        };
        
        this.currentTool = null;
        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
        
        this.init();
    }

    init() {
        this.loadTools();
        this.setupNavigation();
        this.setupEventListeners();
        this.showNotification('Welcome to SheebuTech Tools!', 'info');
    }

    loadTools() {
        for (const sectionId in this.tools) {
            const section = document.getElementById(sectionId);
            if (section) {
                const toolsGrid = section.querySelector('.tools-grid');
                toolsGrid.innerHTML = '';
                
                this.tools[sectionId].forEach(tool => {
                    const toolCard = this.createToolCard(tool);
                    toolsGrid.appendChild(toolCard);
                });
            }
        }
    }

    createToolCard(tool) {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.setAttribute('data-tool', tool.id);
        
        card.innerHTML = `
            <div class="tool-icon">
                <i class="fas fa-${tool.icon}"></i>
            </div>
            <div class="tool-content">
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <button class="tool-button">Use Tool</button>
            </div>
        `;
        
        return card;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.tools-section');
        const homeSection = document.getElementById('home');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
                
                if (targetSection === 'home') {
                    homeSection.style.display = 'block';
                    sections.forEach(section => section.classList.remove('active'));
                    this.closeModal();
                } else {
                    homeSection.style.display = 'none';
                    sections.forEach(section => {
                        section.classList.toggle('active', section.id === targetSection);
                    });
                    this.closeModal();
                }
            });
        });
        
        document.getElementById('explore-tools').addEventListener('click', () => {
            document.querySelector('.nav-link[data-section="image-tools"]').click();
        });

        // Quick tools
        document.querySelectorAll('.quick-tool').forEach(tool => {
            tool.addEventListener('click', () => {
                const toolId = tool.getAttribute('data-tool');
                this.openTool(toolId);
                document.querySelector('.nav-link[data-section="image-tools"]').click();
            });
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tool-card')) {
                const toolCard = e.target.closest('.tool-card');
                const toolId = toolCard.getAttribute('data-tool');
                this.openTool(toolId);
            }
            
            if (e.target.classList.contains('tool-button')) {
                const toolCard = e.target.closest('.tool-card');
                const toolId = toolCard.getAttribute('data-tool');
                this.openTool(toolId);
            }
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('tool-modal').addEventListener('click', (e) => {
            if (e.target.id === 'tool-modal') {
                this.closeModal();
            }
        });
    }

    openTool(toolId) {
        const tool = this.findToolById(toolId);
        if (!tool) return;

        this.currentTool = tool;
        
        const modal = document.getElementById('tool-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.querySelector('.modal-body');
        
        modalTitle.textContent = tool.name;
        modalBody.innerHTML = this.generateToolInterface(tool);
        
        modal.style.display = 'block';
        this.setupToolInterface(tool);
    }

    closeModal() {
        document.getElementById('tool-modal').style.display = 'none';
        this.currentTool = null;
        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
    }

    findToolById(toolId) {
        for (const section in this.tools) {
            const tool = this.tools[section].find(t => t.id === toolId);
            if (tool) return tool;
        }
        return null;
    }

    generateToolInterface(tool) {
        let optionsHTML = '';
        
        switch(tool.id) {
            case 'compress':
                optionsHTML = `
                    <div class="option-group">
                        <label for="compress-size">Target Size:</label>
                        <select id="compress-size">
                            <option value="10">10KB</option>
                            <option value="20">20KB</option>
                            <option value="50">50KB</option>
                            <option value="100">100KB</option>
                            <option value="200">200KB</option>
                            <option value="500">500KB</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label for="compress-quality">Quality: <span class="range-value" id="quality-value">80%</span></label>
                        <input type="range" id="compress-quality" min="1" max="100" value="80">
                    </div>
                `;
                break;
                
            case 'resize':
                optionsHTML = `
                    <div class="option-group">
                        <label for="resize-width">Width (pixels):</label>
                        <input type="number" id="resize-width" placeholder="Enter width">
                    </div>
                    <div class="option-group">
                        <label for="resize-height">Height (pixels):</label>
                        <input type="number" id="resize-height" placeholder="Enter height">
                    </div>
                    <div class="option-group">
                        <label for="resize-keep-ratio">
                            <input type="checkbox" id="resize-keep-ratio" checked> Maintain aspect ratio
                        </label>
                    </div>
                `;
                break;
                
            case 'convert':
                optionsHTML = `
                    <div class="option-group">
                        <label for="convert-format">Output Format:</label>
                        <select id="convert-format">
                            <option value="jpeg">JPG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WEBP</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label for="convert-quality">Quality: <span class="range-value" id="convert-quality-value">90%</span></label>
                        <input type="range" id="convert-quality" min="1" max="100" value="90">
                    </div>
                `;
                break;

            case 'crop':
                optionsHTML = `
                    <div class="option-group">
                        <label for="crop-width">Crop Width:</label>
                        <input type="number" id="crop-width" placeholder="Width in pixels">
                    </div>
                    <div class="option-group">
                        <label for="crop-height">Crop Height:</label>
                        <input type="number" id="crop-height" placeholder="Height in pixels">
                    </div>
                    <div class="option-group">
                        <label for="crop-x">X Position:</label>
                        <input type="number" id="crop-x" placeholder="Start from left" value="0">
                    </div>
                    <div class="option-group">
                        <label for="crop-y">Y Position:</label>
                        <input type="number" id="crop-y" placeholder="Start from top" value="0">
                    </div>
                `;
                break;

            case 'watermark':
                optionsHTML = `
                    <div class="option-group">
                        <label for="watermark-text">Watermark Text:</label>
                        <input type="text" id="watermark-text" placeholder="Enter watermark text" value="SheebuTech">
                    </div>
                    <div class="option-group">
                        <label for="watermark-position">Position:</label>
                        <select id="watermark-position">
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="center">Center</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label for="watermark-opacity">Opacity: <span class="range-value" id="watermark-opacity-value">50%</span></label>
                        <input type="range" id="watermark-opacity" min="1" max="100" value="50">
                    </div>
                `;
                break;
                
            default:
                optionsHTML = `<p>Configure the settings for ${tool.name} below:</p>`;
        }
        
        return `
            <div class="tool-description">${tool.description}</div>
            
            <div class="upload-area" id="upload-area">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload a file or drag and drop</p>
                <p>Maximum file size: 10MB</p>
                <p class="file-size-info">Supported formats: ${this.getSupportedFormats(tool)}</p>
                <input type="file" class="file-input" id="file-input" accept="${this.getFileAccept(tool)}">
            </div>
            
            <div class="file-info" id="file-info"></div>
            
            <div class="options-panel">
                ${optionsHTML}
            </div>
            
            <div class="progress-container" id="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            
            <div class="preview-area">
                <div class="preview-box">
                    <h4>Original Image</h4>
                    <div class="preview-image" id="original-preview">
                        No image selected
                    </div>
                </div>
                <div class="preview-box">
                    <h4>Processed Image</h4>
                    <div class="preview-image" id="processed-preview">
                        Result will appear here
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="process-button" id="process-button">Process Image</button>
                <button class="download-button" id="download-button">Download</button>
                <button class="reset-button" id="reset-button">Reset</button>
            </div>
        `;
    }

    getSupportedFormats(tool) {
        if (tool.category === 'image') {
            return '<span class="format-badge">JPG</span> <span class="format-badge">PNG</span> <span class="format-badge">WEBP</span> <span class="format-badge">GIF</span>';
        }
        if (tool.category === 'pdf') {
            return '<span class="format-badge">PDF</span>';
        }
        return 'All major formats';
    }

    getFileAccept(tool) {
        if (tool.category === 'image') return 'image/*';
        if (tool.category === 'pdf') return '.pdf';
        return '*';
    }

    setupToolInterface(tool) {
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const processButton = document.getElementById('process-button');
        const downloadButton = document.getElementById('download-button');
        const resetButton = document.getElementById('reset-button');
        
        // File upload
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.background = '#f0f8ff';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ccc';
            uploadArea.style.background = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ccc';
            uploadArea.style.background = '';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.handleFileUpload();
            }
        });
        
        // Buttons
        processButton.addEventListener('click', () => this.processImage(tool));
        downloadButton.addEventListener('click', () => this.downloadFile());
        resetButton.addEventListener('click', () => this.resetTool());
        
        // Tool-specific listeners
        this.setupToolSpecificListeners(tool);
    }

    setupToolSpecificListeners(tool) {
        switch(tool.id) {
            case 'compress':
                const compressQuality = document.getElementById('compress-quality');
                const qualityValue = document.getElementById('quality-value');
                
                compressQuality.addEventListener('input', function() {
                    qualityValue.textContent = `${this.value}%`;
                });
                break;
                
            case 'convert':
                const convertQuality = document.getElementById('convert-quality');
                const convertQualityValue = document.getElementById('convert-quality-value');
                
                convertQuality.addEventListener('input', function() {
                    convertQualityValue.textContent = `${this.value}%`;
                });
                break;

            case 'watermark':
                const watermarkOpacity = document.getElementById('watermark-opacity');
                const watermarkOpacityValue = document.getElementById('watermark-opacity-value');
                
                watermarkOpacity.addEventListener('input', function() {
                    watermarkOpacityValue.textContent = `${this.value}%`;
                });
                break;
                
            case 'resize':
                const widthInput = document.getElementById('resize-width');
                const heightInput = document.getElementById('resize-height');
                const keepRatio = document.getElementById('resize-keep-ratio');
                
                widthInput.addEventListener('input', () => {
                    if (keepRatio.checked && this.originalImage) {
                        const ratio = this.originalImage.height / this.originalImage.width;
                        heightInput.value = Math.round(widthInput.value * ratio);
                    }
                });

                heightInput.addEventListener('input', () => {
                    if (keepRatio.checked && this.originalImage) {
                        const ratio = this.originalImage.width / this.originalImage.height;
                        widthInput.value = Math.round(heightInput.value * ratio);
                    }
                });
                break;
        }
    }

    handleFileUpload(event) {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        
        if (!file) return;
        
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File size must be less than 10MB', 'error');
            return;
        }
        
        this.currentFile = file;
        
        // Display file info
        this.displayFileInfo(file);
        
        // Display preview
        this.displayFilePreview(file, 'original-preview');
        
        // Load image for processing
        if (file.type.startsWith('image/')) {
            this.loadImageForProcessing(file);
        }
        
        this.showNotification('File uploaded successfully!', 'success');
    }

    loadImageForProcessing(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                
                // Auto-set resize dimensions
                const widthInput = document.getElementById('resize-width');
                const heightInput = document.getElementById('resize-height');
                if (widthInput && heightInput) {
                    widthInput.value = img.width;
                    heightInput.value = img.height;
                }
                
                // Auto-set crop dimensions
                const cropWidth = document.getElementById('crop-width');
                const cropHeight = document.getElementById('crop-height');
                if (cropWidth && cropHeight) {
                    cropWidth.value = Math.floor(img.width / 2);
                    cropHeight.value = Math.floor(img.height / 2);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const size = (file.size / 1024).toFixed(2);
        
        fileInfo.innerHTML = `
            <p><strong>File Name:</strong> ${file.name}</p>
            <p><strong>File Size:</strong> ${size} KB</p>
            <p><strong>File Type:</strong> ${file.type || 'Unknown'}</p>
        `;
        
        fileInfo.style.display = 'block';
    }

    displayFilePreview(file, previewId) {
        const preview = document.getElementById(previewId);
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = `
                <i class="fas fa-file" style="color: #3498db; font-size: 3rem;"></i>
                <p>${file.name}</p>
            `;
        }
    }

    processImage(tool) {
        if (!this.currentFile) {
            this.showNotification('Please upload a file first', 'error');
            return;
        }

        if (!this.originalImage) {
            this.showNotification('Please wait for image to load', 'error');
            return;
        }

        const processButton = document.getElementById('process-button');
        const downloadButton = document.getElementById('download-button');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        
        // Show progress
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        
        // Disable process button
        processButton.disabled = true;
        processButton.innerHTML = '<span class="loading"></span> Processing...';
        
        // Simulate initial progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 30) {
                clearInterval(progressInterval);
                // Start actual processing
                this.performActualProcessing(tool, processButton, downloadButton, progressContainer, progressBar);
            }
        }, 100);
    }

    performActualProcessing(tool, processButton, downloadButton, progressContainer, progressBar) {
        let progress = 30;
        const progressInterval = setInterval(() => {
            progress += 2;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 80) {
                clearInterval(progressInterval);
                
                // Perform the actual image processing
                this.processImageBasedOnTool(tool).then(processedBlob => {
                    progressBar.style.width = '100%';
                    
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        processButton.disabled = false;
                        processButton.textContent = 'Process Image';
                        
                        // Create file from blob
                        const fileExtension = this.getFileExtensionFromBlob(processedBlob);
                        const fileName = `processed_${this.currentFile.name.replace(/\.[^/.]+$/, "")}.${fileExtension}`;
                        this.processedFile = new File([processedBlob], fileName, { type: processedBlob.type });
                        
                        // Show download button
                        downloadButton.style.display = 'inline-block';
                        
                        // Update preview
                        this.displayFilePreview(this.processedFile, 'processed-preview');
                        
                        this.showNotification('Image processed successfully!', 'success');
                    }, 500);
                }).catch(error => {
                    console.error('Processing error:', error);
                    progressContainer.style.display = 'none';
                    processButton.disabled = false;
                    processButton.textContent = 'Process Image';
                    this.showNotification('Error processing image', 'error');
                });
            }
        }, 100);
    }

    processImageBasedOnTool(tool) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions to match original image
                canvas.width = this.originalImage.width;
                canvas.height = this.originalImage.height;
                
                // Draw original image
                ctx.drawImage(this.originalImage, 0, 0);
                
                let processedCanvas = canvas;
                
                // Apply tool-specific processing
                switch(tool.id) {
                    case 'compress':
                        processedCanvas = this.processImageCompression(canvas);
                        break;
                    case 'resize':
                        processedCanvas = this.processImageResize(canvas);
                        break;
                    case 'convert':
                        processedCanvas = this.processImageConvert(canvas);
                        break;
                    case 'crop':
                        processedCanvas = this.processImageCrop(canvas);
                        break;
                    case 'watermark':
                        processedCanvas = this.processImageWatermark(canvas);
                        break;
                    case 'invert':
                        processedCanvas = this.processImageInvert(canvas);
                        break;
                    default:
                        processedCanvas = canvas;
                }
                
                // Get image format and quality
                let format = 'image/jpeg';
                let quality = 0.8;
                
                if (tool.id === 'convert') {
                    const formatSelect = document.getElementById('convert-format');
                    format = `image/${formatSelect.value}`;
                    quality = parseInt(document.getElementById('convert-quality').value) / 100;
                } else if (tool.id === 'compress') {
                    quality = parseInt(document.getElementById('compress-quality').value) / 100;
                } else {
                    format = this.currentFile.type || 'image/jpeg';
                    quality = 0.9;
                }
                
                // Convert canvas to blob
                processedCanvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                }, format, quality);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    processImageCompression(originalCanvas) {
        // Compression happens via quality parameter in toBlob
        return originalCanvas;
    }

    processImageResize(originalCanvas) {
        const widthInput = document.getElementById('resize-width');
        const heightInput = document.getElementById('resize-height');
        
        let newWidth = parseInt(widthInput.value) || originalCanvas.width;
        let newHeight = parseInt(heightInput.value) || originalCanvas.height;
        
        // Clamp values
        newWidth = Math.max(1, Math.min(newWidth, 10000));
        newHeight = Math.max(1, Math.min(newHeight, 10000));
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        
        const ctx = newCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalCanvas, 0, 0, newWidth, newHeight);
        
        return newCanvas;
    }

    processImageConvert(originalCanvas) {
        // Format conversion happens in toBlob
        return originalCanvas;
    }

    processImageCrop(originalCanvas) {
        const cropX = parseInt(document.getElementById('crop-x').value) || 0;
        const cropY = parseInt(document.getElementById('crop-y').value) || 0;
        const cropWidth = parseInt(document.getElementById('crop-width').value) || originalCanvas.width;
        const cropHeight = parseInt(document.getElementById('crop-height').value) || originalCanvas.height;
        
        // Ensure crop dimensions are within bounds
        const actualCropX = Math.max(0, Math.min(cropX, originalCanvas.width - 1));
        const actualCropY = Math.max(0, Math.min(cropY, originalCanvas.height - 1));
        const actualCropWidth = Math.max(1, Math.min(cropWidth, originalCanvas.width - actualCropX));
        const actualCropHeight = Math.max(1, Math.min(cropHeight, originalCanvas.height - actualCropY));
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = actualCropWidth;
        newCanvas.height = actualCropHeight;
        
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(
            originalCanvas,
            actualCropX, actualCropY, actualCropWidth, actualCropHeight,
            0, 0, actualCropWidth, actualCropHeight
        );
        
        return newCanvas;
    }

    processImageWatermark(originalCanvas) {
        const watermarkText = document.getElementById('watermark-text').value || 'SheebuTech';
        const position = document.getElementById('watermark-position').value;
        const opacity = parseInt(document.getElementById('watermark-opacity').value) / 100;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = originalCanvas.width;
        newCanvas.height = originalCanvas.height;
        
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(originalCanvas, 0, 0);
        
        // Set watermark properties
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Calculate position
        let x, y;
        const padding = 50;
        
        switch(position) {
            case 'top-left':
                x = padding;
                y = padding;
                ctx.textAlign = 'left';
                break;
            case 'top-right':
                x = originalCanvas.width - padding;
                y = padding;
                ctx.textAlign = 'right';
                break;
            case 'bottom-left':
                x = padding;
                y = originalCanvas.height - padding;
                ctx.textAlign = 'left';
                break;
            case 'bottom-right':
                x = originalCanvas.width - padding;
                y = originalCanvas.height - padding;
                ctx.textAlign = 'right';
                break;
            case 'center':
                x = originalCanvas.width / 2;
                y = originalCanvas.height / 2;
                break;
        }
        
        ctx.fillText(watermarkText, x, y);
        
        return newCanvas;
    }

    processImageInvert(originalCanvas) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = originalCanvas.width;
        newCanvas.height = originalCanvas.height;
        
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(originalCanvas, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
        const data = imageData.data;
        
        // Invert colors
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        return newCanvas;
    }

    getFileExtensionFromBlob(blob) {
        const type = blob.type;
        switch(type) {
            case 'image/jpeg': return 'jpg';
            case 'image/png': return 'png';
            case 'image/webp': return 'webp';
            default: return 'jpg';
        }
    }

    downloadFile() {
        if (!this.processedFile) {
            this.showNotification('No file to download', 'error');
            return;
        }
        
        const url = URL.createObjectURL(this.processedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.processedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('File downloaded successfully!', 'success');
    }

    resetTool() {
        const fileInput = document.getElementById('file-input');
        const fileInfo = document.getElementById('file-info');
        const downloadButton = document.getElementById('download-button');
        const originalPreview = document.getElementById('original-preview');
        const processedPreview = document.getElementById('processed-preview');
        
        fileInput.value = '';
        fileInfo.style.display = 'none';
        downloadButton.style.display = 'none';
        originalPreview.innerHTML = 'No image selected';
        processedPreview.innerHTML = 'Result will appear here';
        
        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
        
        this.showNotification('Tool reset successfully', 'info');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sheebuTechApp = new SheebuTechApp();
});