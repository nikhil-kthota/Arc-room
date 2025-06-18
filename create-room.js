// Check authentication
let currentUser = null;

// Initialize Supabase
const SUPABASE_URL = 'https://tscgpbefbtditdmypvfx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzY2dwYmVmYnRkaXRkbXlwdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTM3MjMsImV4cCI6MjA2NTQ4OTcyM30.2wc76kRjCj-qnSUeQt2V5UqQtSQ89LYiefXM7ezEtPk';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/';
    return;
  }
  
  currentUser = {
    id: session.user.id,
    email: session.user.email
  };
});

// File upload handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const dataDisclaimer = document.getElementById('dataDisclaimer');
let selectedFiles = [];

// Error and success message functions
function showError(message, containerId = null) {
  // Remove existing error messages
  const existingErrors = document.querySelectorAll('.error-message');
  existingErrors.forEach(error => error.remove());

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <div class="error-content">
      <div class="error-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <div class="error-text">
        <h4>Error</h4>
        <p>${message}</p>
      </div>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;
  
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      // Add error at the top of the container
      container.insertBefore(errorDiv, container.firstChild);
      return;
    }
  }
  
  // Default: add to top of page
  document.body.insertBefore(errorDiv, document.body.firstChild);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 8000);
}

function showSuccess(message, containerId = null) {
  // Remove existing success messages
  const existingSuccess = document.querySelectorAll('.success-message');
  existingSuccess.forEach(success => success.remove());

  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <div class="success-content">
      <div class="success-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </div>
      <div class="success-text">
        <h4>Success</h4>
        <p>${message}</p>
      </div>
      <button class="success-close" onclick="this.parentElement.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;
  
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      // Add success at the top of the container
      container.insertBefore(successDiv, container.firstChild);
      return;
    }
  }
  
  // Default: add to top of page
  document.body.insertBefore(successDiv, document.body.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (successDiv.parentElement) {
      successDiv.remove();
    }
  }, 5000);
}

// Drag and drop handling
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
});

uploadArea.addEventListener('click', () => {
  fileInput.click();
});

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  handleFiles(files);
}

function handleFiles(files) {
  // Validate files
  const validFiles = files.filter(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
      return false;
    }
    return true;
  });

  if (selectedFiles.length + validFiles.length > 10) {
    showError('Maximum 10 files allowed per room.');
    return;
  }

  selectedFiles = [...selectedFiles, ...validFiles];
  updateFileList();
  
  // Show disclaimer if files are selected
  if (selectedFiles.length > 0) {
    dataDisclaimer.style.display = 'block';
  }
}

function updateFileList() {
  if (selectedFiles.length === 0) {
    fileList.innerHTML = '';
    dataDisclaimer.style.display = 'none';
    return;
  }

  fileList.innerHTML = `
    <h3>Selected Files (${selectedFiles.length})</h3>
    <ul>
      ${selectedFiles.map((file, index) => `
        <li>
          <div class="file-icon ${getFileIconClass(file.type)}"></div>
          <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
          </div>
          <button 
            type="button" 
            class="btn btn-ghost btn-icon"
            onclick="removeFile(${index})"
          >
            <span class="icon-trash"></span>
          </button>
        </li>
      `).join('')}
    </ul>
  `;
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
}

// Room creation with improved validation
async function handleCreateRoom(e) {
  e.preventDefault();

  const roomName = document.getElementById('roomName').value.trim();
  const roomId = document.getElementById('roomId').value.trim().toLowerCase();
  const roomPin = document.getElementById('roomPin').value.trim();
  const dataAgreement = document.getElementById('dataAgreement').checked;

  try {
    // Clear any existing errors
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    // Validate inputs
    if (!roomName) {
      showError('Room name is required. Please enter a descriptive name for your room.');
      document.getElementById('roomName').focus();
      return;
    }

    if (roomName.length < 3) {
      showError('Room name must be at least 3 characters long.');
      document.getElementById('roomName').focus();
      return;
    }

    if (!roomId) {
      showError('Room ID is required. This will be used in the URL to access your room.');
      document.getElementById('roomId').focus();
      return;
    }

    if (roomId.length < 3) {
      showError('Room ID must be at least 3 characters long.');
      document.getElementById('roomId').focus();
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(roomId)) {
      showError('Room ID can only contain letters, numbers, and hyphens. Please remove any special characters or spaces.');
      document.getElementById('roomId').focus();
      return;
    }

    if (!roomPin) {
      showError('PIN is required. Please enter a 4-digit PIN to secure your room.');
      document.getElementById('roomPin').focus();
      return;
    }

    if (!/^\d{4}$/.test(roomPin)) {
      showError('PIN must be exactly 4 digits (0-9). Please enter a valid 4-digit PIN.');
      document.getElementById('roomPin').focus();
      return;
    }

    // Check data agreement if files are selected
    if (selectedFiles.length > 0 && !dataAgreement) {
      showError('Please agree to the data storage terms before uploading files.');
      document.getElementById('dataAgreement').focus();
      return;
    }

    // Check if room key already exists (ONLY check for room ID, not PIN)
    const { data: existingRoom, error: checkError } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('key', roomId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      throw new Error('Failed to check room availability. Please try again.');
    }

    if (existingRoom) {
      showError(`Room ID "${roomId}" is already taken. Please choose a different Room ID.`);
      document.getElementById('roomId').focus();
      return;
    }

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating Room...';
    submitButton.disabled = true;

    // Create room (PIN can be the same as other rooms, only room ID must be unique)
    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        key: roomId,
        name: roomName,
        created_by: currentUser.id,
        pin: roomPin
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Upload files if any
    if (selectedFiles.length > 0) {
      let uploadedCount = 0;
      let failedCount = 0;

      for (const file of selectedFiles) {
        try {
          // Generate unique file name
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${roomId}/${fileName}`;

          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('room-files')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            failedCount++;
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('room-files')
            .getPublicUrl(filePath);

          // Insert file metadata into database
          const { error: fileError } = await supabase
            .from('files')
            .insert({
              room_id: room.id,
              name: file.name,
              type: file.type,
              size: file.size,
              url: publicUrl
            });

          if (fileError) {
            // Clean up uploaded file if database insert fails
            await supabase.storage.from('room-files').remove([filePath]);
            failedCount++;
            continue;
          }

          uploadedCount++;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          failedCount++;
        }
      }

      if (failedCount > 0) {
        showError(`${failedCount} file(s) failed to upload. Room created successfully.`);
      }
    }

    // Store PIN in session storage
    sessionStorage.setItem(`room_pin_${room.key}`, roomPin);

    // Show success message
    showSuccess(`Room "${roomName}" created successfully! Redirecting...`);

    // Redirect to room after a short delay
    setTimeout(() => {
      window.location.href = `room.html?id=${room.key}`;
    }, 1500);

  } catch (err) {
    console.error('Create room error:', err);
    showError(err.message || 'Failed to create room. Please try again.');
    
    // Reset button state
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.textContent = 'Create Room';
    submitButton.disabled = false;
  }
}

// Utility functions
function getFileIconClass(type) {
  type = type.toLowerCase();
  if (type.includes('image')) return 'icon-image';
  if (type.includes('pdf')) return 'icon-pdf';
  if (type.includes('word')) return 'icon-document';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'icon-spreadsheet';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'icon-presentation';
  return 'icon-file';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Add logout functionality
async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = '/';
}