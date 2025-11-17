// script.js  — Fully rewritten / corrected and improved
class SheebuTechApp {
    constructor() {
        this.tools = {
            'image-tools': [
                { id: 'compress', name: 'Image Compression', icon: 'compress', description: 'Compress images to target size using quality parameter.', category: 'image' },
                { id: 'resize', name: 'Image Resizing', icon: 'expand', description: 'Resize images in pixels.', category: 'image' },
                { id: 'convert', name: 'Format Conversion', icon: 'sync', description: 'Convert between JPG, PNG, WEBP formats.', category: 'image' },
                { id: 'crop', name: 'Image Cropping', icon: 'crop', description: 'Crop images to exact dimensions.', category: 'image' },
                { id: 'watermark', name: 'Watermark Addition', icon: 'signature', description: 'Add text watermark to images.', category: 'image' },
                { id: 'invert', name: 'Image Inversion', icon: 'adjust', description: 'Invert image colors.', category: 'image' }
            ],
            'pdf-tools': [
                { id: 'merge-pdf', name: 'Merge PDFs', icon: 'object-group', description: 'Combine multiple PDFs into a single document.', category: 'pdf' },
                { id: 'split-pdf', name: 'Split PDF', icon: 'cut', description: 'Split PDF by pages or ranges.', category: 'pdf' },
                { id: 'compress-pdf', name: 'Compress PDF', icon: 'file-pdf', description: 'Reduce PDF file size while maintaining quality.', category: 'pdf' }
            ],
            'ai-tools': [
                { id: 'ai-enhance', name: 'AI Photo Retouching', icon: 'robot', description: 'Simulated AI enhancement (client-side filters).', category: 'ai' },
                { id: 'ai-background', name: 'AI Background Removal', icon: 'person-circle-minus', description: 'Placeholder for background removal.', category: 'ai' },
                { id: 'ai-restore', name: 'Old Photo Restoration', icon: 'history', description: 'Simulated restoration (client-side).', category: 'ai' }
            ]
        };

        // state
        this.currentTool = null;
        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
        this.transforms = { rotate: 0, flipH: false, flipV: false, zoom: 100 };

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
            if (!section) continue;
            const toolsGrid = section.querySelector('.tools-grid');
            toolsGrid.innerHTML = '';
            this.tools[sectionId].forEach(tool => {
                const card = this.createToolCard(tool);
                toolsGrid.appendChild(card);
            });
        }
    }

    createToolCard(tool) {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.setAttribute('data-tool', tool.id);
        card.innerHTML = `
            <div class="tool-icon"><i class="fas fa-${tool.icon}"></i></div>
            <div class="tool-content">
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <button class="tool-button" type="button">Use Tool</button>
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
                const target = link.getAttribute('data-section');

                navLinks.forEach(n => n.classList.remove('active'));
                link.classList.add('active');

                if (target === 'home') {
                    homeSection.style.display = 'block';
                    sections.forEach(s => s.classList.remove('active'));
                    this.closeModal();
                } else {
                    homeSection.style.display = 'none';
                    sections.forEach(s => s.classList.toggle('active', s.id === target));
                    this.closeModal();
                }
            });
        });

        // Explore button
        const exploreBtn = document.getElementById('explore-tools');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                const target = document.querySelector('.nav-link[data-section="image-tools"]');
                if (target) target.click();
            });
        }

        // Quick tools
        document.querySelectorAll('.quick-tool').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.getAttribute('data-tool');
                // find tool to determine category and nav target
                const tool = this.findToolById(id);
                if (!tool) return;
                let navTarget = 'image-tools';
                if (tool.category === 'pdf') navTarget = 'pdf-tools';
                if (tool.category === 'ai') navTarget = 'ai-tools';

                const nav = document.querySelector(`.nav-link[data-section="${navTarget}"]`);
                if (nav) nav.click();
                // small timeout to ensure section visible
                setTimeout(() => this.openTool(id), 120);
            });
        });

        // Dark mode toggle
        const darkToggle = document.getElementById('toggle-dark');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                const pressed = document.body.classList.contains('dark');
                darkToggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
            });
        }
    }

    setupEventListeners() {
        // Open tool by clicking card or button
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.tool-card');
            if (card) {
                const id = card.getAttribute('data-tool');
                this.openTool(id);
                return;
            }
            if (e.target.classList && e.target.classList.contains('tool-button')) {
                const card2 = e.target.closest('.tool-card');
                if (card2) this.openTool(card2.getAttribute('data-tool'));
                return;
            }
        });

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('close')) {
                this.closeModal();
            }
        });

        // click outside modal to close
        const modal = document.getElementById('tool-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // esc key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    openTool(toolId) {
        const tool = this.findToolById(toolId);
        if (!tool) return;

        this.currentTool = tool;
        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
        this.transforms = { rotate: 0, flipH: false, flipV: false, zoom: 100 }; // reset transforms

        const modal = document.getElementById('tool-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = modal.querySelector('.modal-body');

        modalTitle.textContent = tool.name;
        modalBody.innerHTML = this.generateToolInterface(tool);

        // show modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');

        // attach events inside modal
        this.setupToolInterface(tool);
    }

    closeModal() {
        const modal = document.getElementById('tool-modal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        // reset state
        this.currentTool = null;
        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
        this.transforms = { rotate: 0, flipH: false, flipV: false, zoom: 100 };
    }

    findToolById(id) {
        for (const sec in this.tools) {
            const t = this.tools[sec].find(x => x.id === id);
            if (t) return t;
        }
        return null;
    }

    generateToolInterface(tool) {
        // common controls: rotate, flip, preview zoom
        const commonControls = `
            <div class="options-panel-inner">
                <div class="option-group">
                    <label for="rotate-angle">Rotate (degrees): <span id="rotate-value">0°</span></label>
                    <input type="range" id="rotate-angle" min="-180" max="180" value="0">
                </div>
                <div class="option-group">
                    <label><input type="checkbox" id="flip-h"> Flip Horizontal</label>
                    <label style="margin-left:10px;"><input type="checkbox" id="flip-v"> Flip Vertical</label>
                </div>
                <div class="option-group">
                    <label for="preview-zoom">Preview Zoom: <span id="zoom-value">100%</span></label>
                    <input type="range" id="preview-zoom" min="20" max="300" value="100">
                </div>
            </div>
        `;

        let options = '';

        switch (tool.id) {
            case 'compress':
                options = `
                    <div class="option-group">
                        <label for="compress-quality">Quality: <span class="range-value" id="quality-value">80%</span></label>
                        <input type="range" id="compress-quality" min="1" max="100" value="80">
                    </div>
                `;
                break;
            case 'resize':
                options = `
                    <div class="option-group">
                        <label for="resize-width">Width (px):</label>
                        <input type="number" id="resize-width" placeholder="Width">
                    </div>
                    <div class="option-group">
                        <label for="resize-height">Height (px):</label>
                        <input type="number" id="resize-height" placeholder="Height">
                    </div>
                    <div class="option-group">
                        <label><input type="checkbox" id="resize-keep-ratio" checked> Maintain aspect ratio</label>
                    </div>
                `;
                break;
            case 'convert':
                options = `
                    <div class="option-group">
                        <label for="convert-format">Output Format:</label>
                        <select id="convert-format">
                            <option value="jpeg">JPG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WEBP</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label for="convert-quality">Quality: <span id="convert-quality-value">90%</span></label>
                        <input type="range" id="convert-quality" min="1" max="100" value="90">
                    </div>
                `;
                break;
            case 'crop':
                options = `
                    <div class="option-group">
                        <label for="crop-width">Crop Width (px):</label>
                        <input type="number" id="crop-width" placeholder="Width">
                    </div>
                    <div class="option-group">
                        <label for="crop-height">Crop Height (px):</label>
                        <input type="number" id="crop-height" placeholder="Height">
                    </div>
                    <div class="option-group">
                        <label for="crop-x">X Position (px):</label>
                        <input type="number" id="crop-x" placeholder="X" value="0">
                    </div>
                    <div class="option-group">
                        <label for="crop-y">Y Position (px):</label>
                        <input type="number" id="crop-y" placeholder="Y" value="0">
                    </div>
                `;
                break;
            case 'watermark':
                options = `
                    <div class="option-group">
                        <label for="watermark-text">Watermark Text:</label>
                        <input type="text" id="watermark-text" value="SheebuTech">
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
                        <label for="watermark-opacity">Opacity: <span id="watermark-opacity-value">50%</span></label>
                        <input type="range" id="watermark-opacity" min="1" max="100" value="50">
                    </div>
                `;
                break;
            case 'invert':
            case 'ai-enhance':
            case 'ai-background':
            case 'ai-restore':
                options = `<p>Ready to process your image!</p>`;
                break;
            default:
                options = `<p>Configure the settings for ${tool.name} below:</p>`;
        }

        return `
            <div class="tool-description">${tool.description}</div>
            <div class="upload-area" id="upload-area" title="Click or drop files here">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload or drag & drop</p>
                <p>Maximum file size: 10MB</p>
                <p class="file-size-info">Supported formats: ${this.getSupportedFormats(tool)}</p>
                <input type="file" class="file-input" id="file-input" accept="${this.getFileAccept(tool)}" />
            </div>

            <div class="file-info" id="file-info" style="display:none"></div>

            <div class="options-panel">
                ${tool.category === 'image' ? commonControls : ''}
                ${options}
            </div>

            <div class="progress-container" id="progress-container" style="display:none;">
                <div class="progress-bar" id="progress-bar"></div>
            </div>

            ${tool.category === 'image' || tool.category === 'ai' ? `
            <div class="preview-area">
                <div class="preview-box">
                    <h4>Original Image</h4>
                    <div class="preview-image" id="original-preview">No image selected</div>
                </div>
                <div class="preview-box">
                    <h4>Processed Image</h4>
                    <div class="preview-image" id="processed-preview">Result will appear here</div>
                </div>
            </div>
            ` : ''}

            <div class="action-buttons">
                <button class="process-button" id="process-button" type="button">${tool.category === 'image' ? 'Process Image' : 'Process File'}</button>
                <button class="download-button" id="download-button" type="button">Download</button>
                <button class="reset-button" id="reset-button" type="button">Reset</button>
            </div>
        `;
    }

    getSupportedFormats(tool) {
        if (tool.category === 'image' || tool.category === 'ai') return '<span class="format-badge">JPG</span> <span class="format-badge">PNG</span> <span class="format-badge">WEBP</span> <span class="format-badge">GIF</span>';
        if (tool.category === 'pdf') return '<span class="format-badge">PDF</span>';
        return 'All major formats';
    }

    getFileAccept(tool) {
        if (tool.category === 'image' || tool.category === 'ai') return 'image/*';
        if (tool.category === 'pdf') return '.pdf';
        return '*';
    }

    setupToolInterface(tool) {
        // elements
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const processButton = document.getElementById('process-button');
        const downloadButton = document.getElementById('download-button');
        const resetButton = document.getElementById('reset-button');

        // hide download by default
        downloadButton.style.display = 'none';

        // file input change
        fileInput.addEventListener('change', (e) => this.handleFileUploadFromInput(e.target.files, tool));

        // upload area click
        uploadArea.addEventListener('click', () => fileInput.click());

        // drag events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
            uploadArea.style.background = '#eefaff';
        });
        uploadArea.addEventListener('dragleave', (e) => {
            uploadArea.classList.remove('dragover');
            uploadArea.style.background = '';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            uploadArea.style.background = '';
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                this.handleFileUploadFromInput(e.dataTransfer.files, tool);
            }
        });

        // action buttons
        processButton.addEventListener('click', () => this.processFile(tool));
        downloadButton.addEventListener('click', () => this.downloadFile());
        resetButton.addEventListener('click', () => this.resetTool());

        // tool specific listeners (including common ones)
        if (tool.category === 'image' || tool.category === 'ai') {
            this.setupToolSpecificListeners(tool);
        } else {
            // PDF tools logic could go here (e.g., enable/disable merge/split options)
        }
    }

    setupToolSpecificListeners(tool) {
        // common: rotate + preview zoom + flip
        const rotateInput = document.getElementById('rotate-angle');
        const rotateValue = document.getElementById('rotate-value');
        const zoomInput = document.getElementById('preview-zoom');
        const zoomValue = document.getElementById('zoom-value');
        const flipH = document.getElementById('flip-h');
        const flipV = document.getElementById('flip-v');

        if (rotateInput && rotateValue) {
            rotateInput.addEventListener('input', (e) => {
                rotateValue.textContent = `${e.target.value}°`;
                this.transforms.rotate = parseInt(e.target.value, 10) || 0;
                this.applyPreviewTransforms('original-preview');
                this.applyPreviewTransforms('processed-preview');
            });
        }
        if (zoomInput && zoomValue) {
            zoomInput.addEventListener('input', (e) => {
                zoomValue.textContent = `${e.target.value}%`;
                const scale = parseInt(e.target.value, 10) / 100;
                this.transforms.zoom = parseInt(e.target.value, 10) || 100;
                const orig = document.getElementById('original-preview');
                const proc = document.getElementById('processed-preview');
                // APPLY SCALE TO THE PREVIEW-BOX CONTAINER, not the image itself, for better UI/overflow handling
                if (orig) orig.style.transform = `scale(${scale})`;
                if (proc) proc.style.transform = `scale(${scale})`;
            });
        }
        if (flipH) {
            flipH.addEventListener('change', (e) => {
                this.transforms.flipH = e.target.checked;
                this.applyPreviewTransforms('original-preview');
                this.applyPreviewTransforms('processed-preview');
            });
        }
        if (flipV) {
            flipV.addEventListener('change', (e) => {
                this.transforms.flipV = e.target.checked;
                this.applyPreviewTransforms('original-preview');
                this.applyPreviewTransforms('processed-preview');
            });
        }

        // tool-specific
        switch (tool.id) {
            case 'compress':
                const compressQuality = document.getElementById('compress-quality');
                const qualityValue = document.getElementById('quality-value');
                if (compressQuality) compressQuality.addEventListener('input', function(){ qualityValue.textContent = `${this.value}%`; });
                break;
            case 'convert':
                const convertQuality = document.getElementById('convert-quality');
                const convertQualityValue = document.getElementById('convert-quality-value');
                if (convertQuality) convertQuality.addEventListener('input', function(){ convertQualityValue.textContent = `${this.value}%`; });
                break;
            case 'watermark':
                const watermarkOpacity = document.getElementById('watermark-opacity');
                const watermarkOpacityValue = document.getElementById('watermark-opacity-value');
                if (watermarkOpacity) watermarkOpacity.addEventListener('input', function(){ watermarkOpacityValue.textContent = `${this.value}%`; });
                break;
            case 'resize':
                const widthInput = document.getElementById('resize-width');
                const heightInput = document.getElementById('resize-height');
                const keepRatio = document.getElementById('resize-keep-ratio');
                if (widthInput && heightInput) {
                    widthInput.addEventListener('input', () => {
                        if (keepRatio && keepRatio.checked && this.originalImage) {
                            const ratio = this.originalImage.height / this.originalImage.width;
                            heightInput.value = Math.round((parseInt(widthInput.value) || this.originalImage.width) * ratio);
                        }
                    });
                    heightInput.addEventListener('input', () => {
                        if (keepRatio && keepRatio.checked && this.originalImage) {
                            const ratio = this.originalImage.width / this.originalImage.height;
                            widthInput.value = Math.round((parseInt(heightInput.value) || this.originalImage.height) * ratio);
                        }
                    });
                }
                break;
        }
    }

    handleFileUploadFromInput(fileList, tool) {
        const file = fileList[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File size must be less than 10MB', 'error');
            return;
        }
        this.currentFile = file;
        this.processedFile = null; // Clear processed file on new upload
        this.displayFileInfo(file);

        // Display preview based on category
        if (tool.category === 'image' || tool.category === 'ai') {
            this.displayFilePreview(file, 'original-preview');
            // load actual Image object for processing
            if (file.type && file.type.startsWith('image/')) {
                this.loadImageForProcessing(file);
            }
        } else if (tool.category === 'pdf') {
            const preview = document.getElementById('original-preview');
            if (preview) preview.innerHTML = `<i class="fas fa-file-pdf" style="font-size:3rem;color:var(--primary)"></i><p>${file.name}</p>`;
            const processedPreview = document.getElementById('processed-preview');
            if (processedPreview) processedPreview.innerHTML = 'Result will appear here';
        }
        
        this.showNotification('File uploaded successfully!', 'success');
    }

    loadImageForProcessing(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                // set resize defaults if fields exist
                const w = document.getElementById('resize-width');
                const h = document.getElementById('resize-height');
                if (w) w.value = img.width;
                if (h) h.value = img.height;
                // crop defaults
                const cw = document.getElementById('crop-width');
                const ch = document.getElementById('crop-height');
                if (cw) cw.value = Math.floor(img.width / 2);
                if (ch) ch.value = Math.floor(img.height / 2);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const sizeKB = (file.size / 1024).toFixed(2);
        fileInfo.innerHTML = `
            <p><strong>File Name:</strong> ${file.name}</p>
            <p><strong>File Size:</strong> ${sizeKB} KB</p>
            <p><strong>File Type:</strong> ${file.type || 'Unknown'}</p>
        `;
        fileInfo.style.display = 'block';
    }

    displayFilePreview(file, previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        if (file.type && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                // apply transforms visually to the image and container
                this.applyPreviewTransforms(previewId);
                // Also reset container scale if it was used for zoom
                preview.style.transform = `scale(${this.transforms.zoom / 100})`;
            };
            reader.readAsDataURL(file);
        } else {
            // Placeholder for non-image files like PDF
            preview.innerHTML = `<i class="fas fa-file" style="font-size:3rem;color:var(--primary)"></i><p>${file.name}</p>`;
        }
    }

    applyPreviewTransforms(previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        const img = preview.querySelector('img');
        if (!img) return;
        const rotate = this.transforms.rotate || 0;
        const scaleH = this.transforms.flipH ? -1 : 1;
        const scaleV = this.transforms.flipV ? -1 : 1;
        // Apply flip/rotate to the image element
        img.style.transform = `rotate(${rotate}deg) scale(${scaleH}, ${scaleV})`;
    }

    processFile(tool) {
        if (!this.currentFile) {
            this.showNotification('Please upload a file first', 'error');
            return;
        }

        if (tool.category === 'image' && !this.originalImage) {
            this.showNotification('Please wait for image to load', 'error');
            return;
        }

        const processButton = document.getElementById('process-button');
        const downloadButton = document.getElementById('download-button');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');

        // UI
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        processButton.disabled = true;
        processButton.textContent = 'Processing...';

        // Simulate a processing delay for non-image/AI tools
        if (tool.category === 'pdf' || tool.id === 'ai-background') {
            this.processSimulatedFile(tool, processButton, downloadButton, progressContainer, progressBar);
            return;
        }

        // Image/AI tool processing (Canvas based)
        // simulate progress until actual processing finishes
        let simulated = 0;
        const simInterval = setInterval(() => {
            simulated += 3; // slower progress for image processing
            progressBar.style.width = `${Math.min(simulated, 90)}%`; // Increased to 90%
            if (simulated >= 90) { // Check against new limit
                clearInterval(simInterval);
                // actual processing
                this.processImageBasedOnTool(tool).then(blob => {
                    progressBar.style.width = '100%';
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        processButton.disabled = false;
                        processButton.textContent = 'Process Image';
                        const ext = this.getFileExtensionFromBlobType(blob.type);
                        const baseName = this.currentFile.name.replace(/\.[^/.]+$/, "");
                        const fileName = `processed_${baseName}.${ext}`;
                        this.processedFile = new File([blob], fileName, { type: blob.type });
                        // show download
                        downloadButton.style.display = 'inline-block';
                        // display preview
                        this.displayFilePreview(this.processedFile, 'processed-preview');
                        this.showNotification('Image processed successfully!', 'success');
                    }, 300);
                }).catch(err => {
                    console.error(err);
                    progressContainer.style.display = 'none';
                    processButton.disabled = false;
                    processButton.textContent = 'Process Image';
                    this.showNotification('Error processing image: ' + err.message, 'error');
                });
            }
        }, 80); // Adjusted interval for slower progress
    }

    processSimulatedFile(tool, processButton, downloadButton, progressContainer, progressBar) {
        // For PDF or placeholder AI tools, just simulate a successful process with a delay
        let simulated = 0;
        const simInterval = setInterval(() => {
            simulated += 15;
            progressBar.style.width = `${Math.min(simulated, 99)}%`;
            if (simulated >= 99) {
                clearInterval(simInterval);
                progressBar.style.width = '100%';
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    processButton.disabled = false;
                    processButton.textContent = 'Process File';
                    
                    // Create a simulated output file (e.g., placeholder PDF or PNG for BG removal)
                    const simulatedBlobType = (tool.category === 'pdf' ? 'application/pdf' : 'image/png');
                    const simulatedExt = (tool.category === 'pdf' ? 'pdf' : 'png');
                    const baseName = this.currentFile.name.replace(/\.[^/.]+$/, "");
                    const fileName = `processed_${baseName}.${simulatedExt}`;
                    const simulatedBlob = new Blob(['Simulated processed content for ' + this.currentFile.name], { type: simulatedBlobType });
                    this.processedFile = new File([simulatedBlob], fileName, { type: simulatedBlobType });

                    // Update UI
                    downloadButton.style.display = 'inline-block';
                    const processedPreview = document.getElementById('processed-preview');
                    if (processedPreview) {
                        processedPreview.innerHTML = tool.category === 'pdf'
                            ? `<i class="fas fa-file-pdf" style="font-size:3rem;color:var(--accent)"></i><p>${fileName}</p><p>Simulated output.</p>`
                            : `<i class="fas fa-check-circle" style="font-size:3rem;color:#28a745;"></i><p>Simulated background removal successful.</p>`;
                    }
                    
                    this.showNotification(`${tool.name} completed successfully!`, 'success');
                }, 500);
            }
        }, 120);
    }


    processImageBasedOnTool(tool) {
        return new Promise((resolve, reject) => {
            try {
                // base canvas from original image
                const src = this.originalImage;
                
                // create canvas with original image size (This is the 'source' for all operations)
                const canvas = document.createElement('canvas');
                canvas.width = src.width;
                canvas.height = src.height;
                const ctx = canvas.getContext('2d');

                // apply initial flip/rotate when drawing original image to canvas
                ctx.save();
                // handle flips and rotation around center
                if (this.transforms.rotate || this.transforms.flipH || this.transforms.flipV) {
                    // translate to center
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    const rad = (this.transforms.rotate || 0) * Math.PI / 180;
                    ctx.rotate(rad);
                    const scaleX = this.transforms.flipH ? -1 : 1;
                    const scaleY = this.transforms.flipV ? -1 : 1;
                    ctx.scale(scaleX, scaleY);
                    // draw centered
                    ctx.drawImage(src, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
                } else {
                    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
                }
                ctx.restore();

                // now we have a canvas with transforms applied. For operations like crop/resize, we use this canvas as source.
                let processedCanvas = canvas;

                switch (tool.id) {
                    case 'compress':
                        // no change to pixels, compression done by quality param in toBlob
                        processedCanvas = canvas;
                        break;

                    case 'resize':
                        processedCanvas = this.processImageResize(canvas);
                        break;

                    case 'convert':
                        processedCanvas = canvas; // Conversion happens at toBlob
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
                    
                    // Simulated AI tools using a simple filter
                    case 'ai-enhance':
                    case 'ai-restore':
                        processedCanvas = this.processImageEnhance(canvas);
                        break;

                    default:
                        processedCanvas = canvas;
                }

                // determine output format and quality
                let outFormat = this.currentFile.type || 'image/jpeg';
                let quality = 0.9;

                if (tool.id === 'convert') {
                    const fmt = document.getElementById('convert-format');
                    const q = document.getElementById('convert-quality');
                    if (fmt) outFormat = `image/${fmt.value === 'jpeg' ? 'jpeg' : fmt.value}`;
                    if (q) quality = Math.max(0.01, Math.min(1, parseInt(q.value, 10) / 100));
                } else if (tool.id === 'compress') {
                    const q = document.getElementById('compress-quality');
                    quality = q ? Math.max(0.01, parseInt(q.value, 10) / 100) : 0.8;
                    // keep original mime if possible, unless it's PNG and quality is low
                    if (this.currentFile.type && this.currentFile.type.includes('png') && quality < 0.95) {
                        outFormat = 'image/jpeg'; // Convert PNG to JPG if compressing significantly
                    } else {
                         outFormat = this.currentFile.type || 'image/jpeg';
                    }
                } else {
                    outFormat = this.currentFile.type || 'image/jpeg';
                }

                // Correctly set quality for non-JPEG formats if applicable
                if (outFormat.includes('png')) quality = 1.0; // PNG quality is ignored by most browsers anyway

                processedCanvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to export image'));
                }, outFormat, quality);

            } catch (err) {
                reject(err);
            }
        });
    }

    processImageResize(sourceCanvas) {
        const wIn = document.getElementById('resize-width');
        const hIn = document.getElementById('resize-height');
        let newW = (wIn && wIn.value) ? parseInt(wIn.value, 10) : sourceCanvas.width;
        let newH = (hIn && hIn.value) ? parseInt(hIn.value, 10) : sourceCanvas.height;
        newW = Math.max(1, Math.min(10000, newW));
        newH = Math.max(1, Math.min(10000, newH));
        const newCanvas = document.createElement('canvas');
        newCanvas.width = newW;
        newCanvas.height = newH;
        const ctx = newCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, newW, newH);
        return newCanvas;
    }

    processImageCrop(sourceCanvas) {
        const cropX = parseInt((document.getElementById('crop-x') && document.getElementById('crop-x').value) || 0, 10);
        const cropY = parseInt((document.getElementById('crop-y') && document.getElementById('crop-y').value) || 0, 10);
        const cropW = parseInt((document.getElementById('crop-width') && document.getElementById('crop-width').value) || sourceCanvas.width, 10);
        const cropH = parseInt((document.getElementById('crop-height') && document.getElementById('crop-height').value) || sourceCanvas.height, 10);

        const actualX = Math.max(0, Math.min(cropX, sourceCanvas.width - 1));
        const actualY = Math.max(0, Math.min(cropY, sourceCanvas.height - 1));
        const actualW = Math.max(1, Math.min(cropW, sourceCanvas.width - actualX));
        const actualH = Math.max(1, Math.min(cropH, sourceCanvas.height - actualY));

        const newCanvas = document.createElement('canvas');
        newCanvas.width = actualW;
        newCanvas.height = actualH;
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, actualX, actualY, actualW, actualH, 0, 0, actualW, actualH);
        return newCanvas;
    }

    processImageWatermark(sourceCanvas) {
        const text = (document.getElementById('watermark-text') && document.getElementById('watermark-text').value) || 'SheebuTech';
        const pos = (document.getElementById('watermark-position') && document.getElementById('watermark-position').value) || 'bottom-right';
        const opacity = (document.getElementById('watermark-opacity') && parseInt(document.getElementById('watermark-opacity').value, 10) / 100) || 0.5;

        const newCanvas = document.createElement('canvas');
        newCanvas.width = sourceCanvas.width;
        newCanvas.height = sourceCanvas.height;
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, 0, 0);

        ctx.save();
        ctx.globalAlpha = opacity;
        // size relative to image
        const size = Math.max(16, Math.floor(sourceCanvas.width / 20));
        ctx.font = `bold ${size}px Arial`;
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.textBaseline = 'middle';

        let x = 0, y = 0;
        const padding = Math.max(10, Math.floor(sourceCanvas.width / 50));
        switch (pos) {
            case 'top-left': x = padding; y = padding; ctx.textAlign = 'left'; break;
            case 'top-right': x = sourceCanvas.width - padding; y = padding; ctx.textAlign = 'right'; break;
            case 'bottom-left': x = padding; y = sourceCanvas.height - padding; ctx.textAlign = 'left'; break;
            case 'bottom-right': x = sourceCanvas.width - padding; y = sourceCanvas.height - padding; ctx.textAlign = 'right'; break;
            case 'center': default: x = sourceCanvas.width / 2; y = sourceCanvas.height / 2; ctx.textAlign = 'center'; break;
        }
        // shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(text, x, y);
        ctx.restore();

        return newCanvas;
    }

    processImageInvert(sourceCanvas) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = sourceCanvas.width;
        newCanvas.height = sourceCanvas.height;
        const ctx = newCanvas.getContext('2d');
        // Draw the source (which includes rotation/flip) onto the new canvas
        ctx.drawImage(sourceCanvas, 0, 0); 
        
        // Get image data from the new canvas
        const id = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
        const data = id.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];    // Red
            data[i+1] = 255 - data[i+1]; // Green
            data[i+2] = 255 - data[i+2]; // Blue
            // Alpha (data[i+3]) is untouched
        }
        ctx.putImageData(id, 0, 0); // Put the inverted data back
        return newCanvas;
    }

    // A simple, simulated enhancement filter (like slight boost to contrast/saturation)
    processImageEnhance(sourceCanvas) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = sourceCanvas.width;
        newCanvas.height = sourceCanvas.height;
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, 0, 0);
        
        // Simple filter: increase contrast slightly
        ctx.filter = 'contrast(1.1) saturate(1.1)'; 
        ctx.drawImage(sourceCanvas, 0, 0); 
        ctx.filter = 'none';

        // Add a visible text to indicate AI simulation
        ctx.save();
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; 
        ctx.font = "bold 24px Arial";
        ctx.fillText("AI Enhanced (Simulated)", 20, newCanvas.height - 20);
        ctx.restore();

        return newCanvas;
    }

    getFileExtensionFromBlobType(type) {
        if (!type) return 'jpg';
        if (type.includes('jpeg')) return 'jpg';
        if (type.includes('png')) return 'png';
        if (type.includes('webp')) return 'webp';
        if (type.includes('pdf')) return 'pdf';
        return 'jpg';
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
        a.remove();
        URL.revokeObjectURL(url);
        this.showNotification('File downloaded successfully!', 'success');
    }

    resetTool() {
        // reset UI elements and state
        const fileInput = document.getElementById('file-input');
        const fileInfo = document.getElementById('file-info');
        const downloadButton = document.getElementById('download-button');
        const originalPreview = document.getElementById('original-preview');
        const processedPreview = document.getElementById('processed-preview');
        if (fileInput) fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';
        if (downloadButton) downloadButton.style.display = 'none';
        
        // Reset previews
        if (originalPreview) {
            originalPreview.innerHTML = 'No image selected';
            originalPreview.style.transform = 'scale(1)'; // Reset zoom
        }
        if (processedPreview) {
             processedPreview.innerHTML = 'Result will appear here';
             processedPreview.style.transform = 'scale(1)'; // Reset zoom
        }

        this.currentFile = null;
        this.processedFile = null;
        this.originalImage = null;
        this.transforms = { rotate: 0, flipH: false, flipV: false, zoom: 100 };

        // reset sliders/inputs if present
        const rotate = document.getElementById('rotate-angle');
        const rotateVal = document.getElementById('rotate-value');
        if (rotate) { rotate.value = 0; if(rotateVal) rotateVal.textContent = '0°'; }
        
        const zoom = document.getElementById('preview-zoom');
        const zoomVal = document.getElementById('zoom-value');
        if (zoom) { zoom.value = 100; if(zoomVal) zoomVal.textContent = '100%'; }
        
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });


        this.showNotification('Tool reset successfully', 'info');
    }

    showNotification(message, type = 'info') {
        // remove existing
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.classList.add('show'), 40);
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 300);
        }, 3000);
    }
}

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sheebuTechApp = new SheebuTechApp();
});