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
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }
    return true;
  });

  if (selectedFiles.length + validFiles.length > 10) {
    alert('Maximum 10 files allowed.');
    return;
  }

  selectedFiles = [...selectedFiles, ...validFiles];
  updateFileList();
}

function updateFileList() {
  if (selectedFiles.length === 0) {
    fileList.innerHTML = '';
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

// Room creation
async function handleCreateRoom(e) {
  e.preventDefault();

  const roomName = document.getElementById('roomName').value;
  const roomId = document.getElementById('roomId').value.toLowerCase();
  const roomPin = document.getElementById('roomPin').value;

  try {
    // Validate inputs
    if (!roomName.trim()) {
      alert('Room name is required');
      return;
    }

    if (!roomId.trim()) {
      alert('Room ID is required');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(roomId)) {
      alert('Room ID can only contain letters, numbers, and hyphens');
      return;
    }

    if (!/^\d{4}$/.test(roomPin)) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    // Check if room key already exists
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('id')
      .eq('key', roomId)
      .single();

    if (existingRoom) {
      alert('Room key already exists. Please choose a different one.');
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
      throw new Error(error.message);
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
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
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
            throw new Error(`Failed to save file metadata: ${fileError.message}`);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
    }

    // Store PIN in session storage
    sessionStorage.setItem(`room_pin_${room.key}`, roomPin);

    // Redirect to room
    window.location.href = `room.html?id=${room.key}`;
  } catch (err) {
    console.error('Create room error:', err);
    alert(err.message || 'Failed to create room');
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