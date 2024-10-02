document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileSelectButton = document.getElementById('fileSelectButton');
    const textInputContainer = document.getElementById('textInputContainer');
    const fileInfo = document.getElementById('fileInfo');
    const scanOptionsContainer = document.getElementById('scanOptionsContainer');
    const modal = document.getElementById('resultModal');
    const cancerTypeSpan = document.getElementById('cancerType');
    const closeBtn = document.querySelector('.close');
    const uploadForm = document.getElementById('uploadForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const documentPreview = document.getElementById('documentPreview');

    // Function to handle file type changes
    function handleFileTypeChange() {
        const selectedFileType = document.querySelector('input[name="fileType"]:checked').value;
        
        if (selectedFileType === 'text') {
            toggleElementDisplay(fileInput, false);
            toggleElementDisplay(fileSelectButton, false);
            toggleElementDisplay(textInputContainer, true);
            toggleElementDisplay(scanOptionsContainer, false);
            clearFileInput();  // Clear file input when switching to text
        } else {
            toggleElementDisplay(textInputContainer, false);
            toggleElementDisplay(fileSelectButton, true);
            toggleElementDisplay(fileInput, false);
            
            if (selectedFileType === 'image') {
                toggleElementDisplay(scanOptionsContainer, true);
                fileInput.accept = 'image/*';
            } else {
                toggleElementDisplay(scanOptionsContainer, false);
                fileInput.accept = '.pdf';
            }
        }
        fileInfo.textContent = '';
    }

    // Function to create document preview
    function createDocumentPreview(filePath, fileType) {
        documentPreview.innerHTML = ''; // Clear previous preview
        
        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = filePath;
            img.alt = 'Uploaded Image';
            documentPreview.appendChild(img);
        } else if (fileType === 'pdf') {
            const iframe = document.createElement('iframe');
            iframe.src = filePath;
            documentPreview.appendChild(iframe);
        }
    }

    // Function to handle file selection button click
    function handleFileSelectClick() {
        fileInput.click();
    }

    // Function to display selected file information
    function displayFileInfo() {
        fileInfo.textContent = fileInput.files.length > 0 ? `Selected file: ${fileInput.files[0].name}` : '';
    }

    // Function to validate the form before submission
    function validateForm() {
        const fileType = document.querySelector('input[name="fileType"]:checked').value;

        if (fileType === 'text') {
            const textInput = document.getElementById('textInput').value.trim();
            if (!textInput) {
                alert('Please enter some text.');
                return false;
            }
        } else {
            if (fileInput.files.length === 0) {
                alert('Please select a file to upload.');
                return false;
            } else if (fileType === 'image' && !document.querySelector('input[name="scanType"]:checked')) {
                alert('Please select a scan type for the image.');
                return false;
            }
        }
        return true;
    }

    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault();

        if (!validateForm()) return;

        const formData = new FormData(uploadForm);
        const fileType = document.querySelector('input[name="fileType"]:checked').value;

        // Show the loading spinner
        toggleElementDisplay(loadingSpinner, true);

        fetch('/scan', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide the loading spinner
            toggleElementDisplay(loadingSpinner, false);

            if (data.success) {
                cancerTypeSpan.textContent = data.cancerClass[0];
                
                // Create preview for image and PDF files
                if (fileType !== 'text' && data.filePath) {
                    createDocumentPreview(data.filePath, fileType);
                }
                
                toggleModal(true);
            } else {
                alert('Error uploading data. Please try again.');
            }
        })
        .catch(error => {
            // Hide the loading spinner
            toggleElementDisplay(loadingSpinner, false);
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    // Helper function to toggle modal visibility
    function toggleModal(show) {
        modal.style.display = show ? 'block' : 'none';
    }

    // Helper function to toggle element display
    function toggleElementDisplay(element, show) {
        element.style.display = show ? 'block' : 'none';
    }

    // Helper function to clear file input
    function clearFileInput() {
        fileInput.value = ''; // Clear file input value
        documentPreview.innerHTML = ''; // Clear preview
    }

    // Initialize event listeners
    function initEventListeners() {
        document.querySelectorAll('input[name="fileType"]').forEach(radio => {
            radio.addEventListener('change', handleFileTypeChange);
        });
        
        fileSelectButton.addEventListener('click', handleFileSelectClick);
        fileInput.addEventListener('change', displayFileInfo);
        uploadForm.addEventListener('submit', handleFormSubmit);

        // Close modal on button click
        closeBtn.addEventListener('click', () => {
            toggleModal(false);
            documentPreview.innerHTML = ''; // Clear preview when closing modal
        });

        // Close modal when clicking outside of it
        window.addEventListener('click', event => {
            if (event.target === modal) {
                toggleModal(false);
                documentPreview.innerHTML = ''; // Clear preview when closing modal
            }
        });
    }

    // Initialize the page
    function init() {
        initEventListeners();
    }

    // Run init on DOMContentLoaded
    init();
});