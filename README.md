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

- **Frontend**: React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS with custom black-silver theme
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Routing**: React Router DOM

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
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── FileUpload.tsx # File upload component
│   │   ├── FileViewer.tsx # File viewer component
│   │   ├── Header.tsx     # Navigation header
│   │   ├── Footer.tsx     # Page footer
│   │   └── Layout.tsx     # Main layout wrapper
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx   # Landing page
│   │   ├── LoginPage.tsx  # User login
│   │   ├── RegisterPage.tsx # User registration
│   │   ├── CreateRoomPage.tsx # Create new room
│   │   ├── RoomPage.tsx   # Room view and file management
│   │   ├── ProfilePage.tsx # User profile
│   │   └── EnterRoomPage.tsx # Room access
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/          # API services
│   │   ├── authService.ts # Authentication logic
│   │   ├── roomService.ts # Room management
│   │   └── userService.ts # User operations
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Shared types
│   ├── utils/             # Utility functions
│   │   └── cn.ts          # Class name utilities
│   ├── lib/               # External library configurations
│   │   └── supabase.ts    # Supabase client setup
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
├── public/
│   └── favicon.svg        # App favicon
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.ts         # Vite configuration
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