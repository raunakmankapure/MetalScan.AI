// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadForm = document.querySelector('.upload-form');

// File upload handling
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }

    // Show file info
    fileInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span><strong>${file.name}</strong> (${formatFileSize(file.size)})</span>
        </div>
    `;
    fileInfo.classList.add('show');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.createElement('img');
        preview.src = e.target.result;
        preview.style.cssText = `
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            margin-top: 1rem;
            border: 2px solid var(--border);
        `;
        fileInfo.appendChild(preview);
    };
    reader.readAsDataURL(file);
}

// Form submission handling
uploadForm.addEventListener('submit', (e) => {
    if (!fileInput.files.length) {
        e.preventDefault();
        showNotification('Please select an image file first.', 'error');
        return;
    }

    // Show loading state
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;

    // Add a small delay to show the loading animation
    setTimeout(() => {
        // Form will submit naturally
    }, 500);
});

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
            <span>${message}</span>
        </div>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'error' ? 'var(--error-color)' : type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Download report function
function downloadReport() {
    const prediction = document.querySelector('.defect-name')?.textContent;
    const imageSrc = document.querySelector('.analyzed-image')?.src;

    if (!prediction) return;

    // Create a simple report
    const reportContent = `
Metal Defect Analysis Report
===========================

Analysis Date: ${new Date().toLocaleDateString()}
Analysis Time: ${new Date().toLocaleTimeString()}

Detected Defect Type: ${prediction}

Analysis Details:
- AI Model: MetalScan AI v1.0
- Confidence: High
- Processing Time: < 1 second

Recommendations:
${getRecommendations(prediction)}

---
Generated by MetalScan AI
    `.trim();

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metal-defect-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Report downloaded successfully!', 'success');
}

function getRecommendations(defectType) {
    const recommendations = {
        'Crazing': '• Inspect for stress concentrations\n• Check material composition\n• Review manufacturing process parameters',
        'Inclusion': '• Verify raw material quality\n• Check melting process\n• Implement better filtration systems',
        'Patches': '• Review surface preparation\n• Check coating application\n• Inspect for contamination sources',
        'Pitted': '• Investigate corrosion causes\n• Check environmental conditions\n• Consider protective coatings',
        'Rolled': '• Review rolling parameters\n• Check roller condition\n• Verify material temperature',
        'Scratches': '• Inspect handling procedures\n• Check transport methods\n• Review storage conditions'
    };

    return recommendations[defectType] || '• Consult with quality control team\n• Review manufacturing process\n• Consider additional testing';
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add stagger animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${0.6 + index * 0.1}s`;
    });

    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('[class*="animate"], .feature-card').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
});