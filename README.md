## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🌟 Overview

ArcRoom is a modern, secure file storage and sharing platform that allows users to create private rooms with custom access controls. Built with a focus on simplicity and security, it provides an intuitive interface for file management with PIN-protected room access.

### Key Highlights

- 🔐 **Secure Room-Based Access** - Create rooms with unique keys and 4-digit PINs
- 📁 **File Management** - Upload, preview, download, and organize files
- 👥 **User Authentication** - Secure user registration and login system
- 🎨 **Modern UI** - Clean, responsive design with dark theme
- 📱 **Cross-Platform** - Works seamlessly across all devices
- ⚡ **Real-time Updates** - Instant file uploads and management

## ✨ Features

### Core Features

- **Room Creation & Management**
  - Create secure rooms with custom keys
  - PIN-protected access (4-digit)
  - Room sharing with dynamic URLs
  - Room deletion with cascade file cleanup

- **File Operations**
  - Drag & drop file uploads
  - Multiple file format support
  - In-browser file preview (images, PDFs, documents)
  - Secure file download
  - File deletion with confirmation

- **User Management**
  - User registration and authentication
  - Profile management
  - Account deletion with data cleanup
  - Session management

- **Security Features**
  - Row Level Security (RLS) policies
  - PIN-based room access
  - Secure file storage
  - User data isolation

### Advanced Features

- **File Preview System**
  - Image preview with zoom
  - PDF viewer integration
  - Document type detection
  - Fallback download options

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interfaces
  - Cross-browser compatibility

## 🛠 Tech Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **Responsive Design** - Mobile-first approach

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication system
  - File storage
  - Row Level Security (RLS)

### Storage
- **Supabase Storage** - Secure file storage with CDN
- **Session Storage** - Client-side PIN caching

### Development Tools
- **Git** - Version control
- **GitHub** - Code repository and collaboration
- **GitHub Pages** - Static site hosting

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Storage       │
│   (HTML/CSS/JS) │◄──►│   (PostgreSQL)  │◄──►│   (File Bucket) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │  Auth   │             │   RLS   │             │  CDN    │
    │ System  │             │Policies │             │Delivery │
    └─────────┘             └─────────┘             └─────────┘
```

### Database Schema

```sql
-- Users (handled by Supabase Auth)
auth.users
├── id (uuid, primary key)
├── email (text)
└── created_at (timestamp)

-- Rooms
rooms
├── id (uuid, primary key)
├── key (text, unique)
├── name (text)
├── created_at (timestamp)
├── created_by (uuid, foreign key)
└── pin (text)

-- Files
files
├── id (uuid, primary key)
├── room_id (uuid, foreign key)
├── name (text)
├── type (text)
├── size (bigint)
├── url (text)
└── uploaded_at (timestamp)
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Supabase account (for backend setup)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikhil-kthota/Arc-room.git
   cd Arc-room
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the provided SQL migrations
   - Configure storage bucket

3. **Configure environment**
   - Update Supabase credentials in JavaScript files
   - Set up storage policies

4. **Deploy**
   - Host on GitHub Pages or any static hosting service

## 📦 Installation

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/nikhil-kthota/Arc-room.git
   cd Arc-room
   ```

2. **Serve locally**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Access the application**
   ```
   http://localhost:8000
   ```

### Production Deployment

1. **GitHub Pages**
   - Fork the repository
   - Enable GitHub Pages in repository settings
   - Access via: `https://yourusername.github.io/Arc-room/`

2. **Other Static Hosts**
   - Netlify, Vercel, or any static hosting service
   - Simply upload the files to your hosting provider

## ⚙️ Configuration

### Supabase Setup

1. **Create Project**
   ```bash
   # Create new Supabase project at https://supabase.com
   ```

2. **Database Migrations**
   ```sql
   -- Run migrations in supabase/migrations/ folder
   -- in chronological order
   ```

3. **Storage Configuration**
   ```sql
   -- Create 'room-files' bucket
   -- Set up storage policies for file access
   ```

4. **Environment Variables**
   ```javascript
   // Update in app.js, create-room.js, profile.js, room.js
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
   ```

### Storage Policies

Create these policies in Supabase Dashboard:

```sql
-- Policy 1: Upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'room-files');

-- Policy 2: View files
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'room-files');

-- Policy 3: Delete files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'room-files');
```

## 📖 Usage

### Creating a Room

1. **Register/Login** to your account
2. **Click "Create Room"** from the dashboard
3. **Fill in details**:
   - Room Name (descriptive name)
   - Room Key (unique identifier)
   - 4-digit PIN (access control)
4. **Upload files** (optional during creation)
5. **Share** room key and PIN with others

### Accessing a Room

1. **Visit the homepage**
2. **Enter Room Key** and **PIN**
3. **Browse and download** files
4. **Upload files** (if you're the room creator)

### Managing Files

- **Upload**: Drag & drop or click to browse
- **Preview**: Click on any file to view
- **Download**: Use download button or right-click
- **Delete**: Use trash icon (room creators only)

## 📚 API Documentation

### Authentication Endpoints

```javascript
// Register user
supabase.auth.signUp({ email, password })

// Login user
supabase.auth.signInWithPassword({ email, password })

// Logout user
supabase.auth.signOut()
```

### Room Operations

```javascript
// Create room
supabase.from('rooms').insert({
  key: roomKey,
  name: roomName,
  created_by: userId,
  pin: pin
})

// Get room by key
supabase.from('rooms').select('*').eq('key', roomKey)

// Delete room
supabase.from('rooms').delete().eq('id', roomId)
```

### File Operations

```javascript
// Upload file
supabase.storage.from('room-files').upload(filePath, file)

// Get file URL
supabase.storage.from('room-files').getPublicUrl(filePath)

// Delete file
supabase.storage.from('room-files').remove([filePath])
```

## 🗄️ Database Schema

### Tables Overview

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `rooms` | Store room information | `created_by` → `auth.users.id` |
| `files` | Store file metadata | `room_id` → `rooms.id` |

### Detailed Schema

```sql
-- Rooms table
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pin text NOT NULL
);

-- Files table
CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);
```

## 🔒 Security

### Security Measures

- **Row Level Security (RLS)** - Database-level access control
- **PIN Protection** - 4-digit PIN for room access
- **User Authentication** - Secure login system
- **File Access Control** - Only authorized users can upload/delete
- **Session Management** - Secure session handling
- **Input Validation** - Client and server-side validation

### RLS Policies

```sql
-- Room policies
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update their rooms" ON rooms FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Room creators can delete their rooms" ON rooms FOR DELETE USING (auth.uid() = created_by);

-- File policies
CREATE POLICY "Anyone can view files" ON files FOR SELECT USING (true);
CREATE POLICY "Room creators can upload files" ON files FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = files.room_id AND rooms.created_by = auth.uid()));
CREATE POLICY "Room creators can delete their files" ON files FOR DELETE USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = files.room_id AND rooms.created_by = auth.uid()));
```

## 🚀 Deployment

### GitHub Pages Deployment

1. **Fork the repository**
2. **Go to Settings** → **Pages**
3. **Select source**: Deploy from a branch
4. **Choose branch**: main
5. **Save** and wait for deployment

### Custom Domain Setup

1. **Add CNAME file** with your domain
2. **Configure DNS** to point to GitHub Pages
3. **Enable HTTPS** in repository settings

### Environment Configuration

Update the following files with your Supabase credentials:
- `app.js`
- `create-room.js`
- `profile.js`
- `room.js`

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Code Style

- Use consistent indentation (2 spaces)
- Follow semantic HTML structure
- Use meaningful variable names
- Comment complex logic
- Test across different browsers

### Reporting Issues

Please use the GitHub Issues tab to report:
- Bugs and errors
- Feature requests
- Security vulnerabilities
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Nikhil Thota

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Contact

### Developer

**Nikhil Thota**
- GitHub: [@nikhil-kthota](https://github.com/nikhil-kthota)
- LinkedIn: [nikhilkthota](https://www.linkedin.com/in/nikhilkthota)
- Email: [Contact via gmail](nikhilkthota@gmail.com)

### Project Links

- **Live Demo**: [https://nikhil-kthota.github.io/arcroom/](https://nikhil-kthota.github.io/arcroom/)
- **Repository**: [https://github.com/nikhil-kthota/arcoom](https://github.com/nikhil-kthota/arcroom)
- **Issues**: [https://github.com/nikhil-kthota/arcroom/issues](https://github.com/nikhil-kthota/arcroom/issues)

---
