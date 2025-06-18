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

// Enhanced Error display functions with better UI
function showError(message, containerId = null) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.innerHTML = `
    <div class="error-notification-content">
      <div class="error-notification-icon">
        <span class="icon-alert-circle"></span>
      </div>
      <div class="error-notification-text">
        <div class="error-notification-title">Error</div>
        <div class="error-notification-message">${message}</div>
      </div>
      <button class="error-notification-close" onclick="this.parentElement.parentElement.remove()">
        <span class="icon-x"></span>
      </button>
    </div>
  `;
  
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      // Remove existing errors
      const existingErrors = container.querySelectorAll('.error-notification, .error-message');
      existingErrors.forEach(error => error.remove());
      
      // Add new error at the top
      container.insertBefore(errorDiv, container.firstChild);
      return;
    }
  }
  
  // Default: add to body (top-right corner)
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 8000);
}

function showSuccess(message, containerId = null) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-notification';
  successDiv.innerHTML = `
    <div class="success-notification-content">
      <div class="success-notification-icon">
        <span class="icon-check-circle"></span>
      </div>
      <div class="success-notification-text">
        <div class="success-notification-title">Success</div>
        <div class="success-notification-message">${message}</div>
      </div>
      <button class="success-notification-close" onclick="this.parentElement.parentElement.remove()">
        <span class="icon-x"></span>
      </button>
    </div>
  `;
  
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      // Remove existing messages
      const existingMessages = container.querySelectorAll('.success-notification, .error-notification, .success-message, .error-message');
      existingMessages.forEach(msg => msg.remove());
      
      // Add new message at the top
      container.insertBefore(successDiv, container.firstChild);
      return;
    }
  }
  
  // Default: add to body (top-right corner)
  document.body.appendChild(successDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (successDiv.parentElement) {
      successDiv.remove();
    }
  }, 5000);
}

// File upload handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const dataDisclaimer = document.getElementById('dataDisclaimer');
let selectedFiles = [];

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
      showError(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }
    return true;
  });

  if (selectedFiles.length + validFiles.length > 10) {
    showError('Maximum 10 files allowed.');
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

// Room creation with enhanced error handling
async function handleCreateRoom(e) {
  e.preventDefault();

  const roomName = document.getElementById('roomName').value.trim();
  const roomId = document.getElementById('roomId').value.trim().toLowerCase();
  const roomPin = document.getElementById('roomPin').value.trim();
  const dataAgreement = document.getElementById('dataAgreement').checked;

  try {
    // Validate inputs
    if (!roomName) {
      showError('Room name is required');
      return;
    }

    if (!roomId) {
      showError('Room ID is required');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(roomId)) {
      showError('Room ID can only contain letters, numbers, and hyphens');
      return;
    }

    if (!/^\d{4}$/.test(roomPin)) {
      showError('PIN must be exactly 4 digits');
      return;
    }

    // Check data agreement if files are selected
    if (selectedFiles.length > 0 && !dataAgreement) {
      showError('Please agree to the data storage terms before uploading files');
      return;
    }

    // Check if room key already exists
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('id')
      .eq('key', roomId)
      .single();

    if (existingRoom) {
      showError('Room ID already exists. Please choose a different one.');
      return;
    }

    // Create room
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
      // Handle specific database errors
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('rooms_key_key')) {
          showError('Room ID already exists. Please choose a different one.');
        } else {
          showError('A room with these details already exists. Please try different values.');
        }
      } else {
        showError(`Failed to create room: ${error.message}`);
      }
      return;
    }

    // Upload files if any
    if (selectedFiles.length > 0) {
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
            showError(`Failed to upload ${file.name}: ${uploadError.message}`);
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
            showError(`Failed to save file metadata: ${fileError.message}`);
            continue;
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          showError(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
    }

    // Store PIN in session storage
    sessionStorage.setItem(`room_pin_${room.key}`, roomPin);

    // Show success message
    showSuccess('Room created successfully! Redirecting...');

    // Redirect to room after a short delay
    setTimeout(() => {
      window.location.href = `room.html?id=${room.key}`;
    }, 1500);
  } catch (err) {
    console.error('Create room error:', err);
    showError(err.message || 'Failed to create room');
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