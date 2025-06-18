# ArcRoom - Secure File Storage & Sharing

A secure file storage and sharing platform with room-based organization and PIN protection.

## Features

- **Secure Rooms**: Create private rooms with custom keys
- **PIN Protection**: 4-digit PIN security for room access
- **File Upload**: Drag & drop file uploads with preview
- **File Viewer**: In-browser file viewing for images and documents
- **User Management**: Account creation and profile management
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Custom CSS with black-silver theme
- **Icons**: Custom icon system
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd arcroom
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase
- Create a new Supabase project
- Run the migrations in the `supabase/migrations` folder
- Create a storage bucket named `room-files`
- Set up storage policies (see migration files for details)

5. Start the development server
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
arcroom/
├── index.html              # Home page
├── create-room.html         # Create room page
├── room.html               # Room view page
├── profile.html            # User profile page
├── app.js                  # Main application logic
├── create-room.js          # Create room functionality
├── room.js                 # Room view functionality
├── profile.js              # Profile page functionality
├── styles.css              # Main styles
├── scrollbar.css           # Custom scrollbar styles
├── room-layout.css         # Room-specific layout styles
├── supabase/
│   └── migrations/         # Database migrations
├── public/
│   └── favicon.ico         # Favicon
└── package.json            # Dependencies and scripts
```

## Deployment

This application can be deployed to any static hosting service:

- **Netlify**: Connect your repository and deploy automatically
- **Vercel**: Import project and deploy with zero configuration
- **GitHub Pages**: Build and deploy to gh-pages branch
- **Firebase Hosting**: Use Firebase CLI to deploy

### Environment Variables for Production

Make sure to set these environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema

The application uses the following main tables:
- `rooms`: Store room information with keys and PINs
- `files`: Store file metadata and URLs
- `auth.users`: Supabase auth users (managed automatically)

See `supabase/migrations/` for complete schema details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.