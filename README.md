# Carousify

A production-ready Instagram Grid Carousel Maker with a Pinterest-inspired aesthetic. Create stunning carousel posts with prebuilt collage templates, drag-and-drop functionality, and AI-powered features.

## Features

- **Template System**: JSON-based prebuilt collage templates with Pinterest-style masonry grid gallery
- **Canvas Editor**: 3050x1350 canvas with drag-and-drop image placement
- **Image Editing**: Scale, crop, position images with snap-to-grid functionality
- **Export System**: Slice into 3 equal 1080x1350 images, download as PNG or ZIP
- **Project Management**: Save and load projects with autosave and backend sync
- **AI Features**: Face detection auto-crop, background removal, smart layout suggestions
- **Cross-Platform**: Web app and desktop application (Tauri)

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TailwindCSS
- Framer Motion
- react-konva (canvas editor)
- Zustand (state management)

### Backend
- Python FastAPI
- PostgreSQL
- OpenCV (face detection)
- rembg (background removal)

### Desktop
- Rust + Tauri

## Folder Structure

```
carousify/
├── web/                     # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   ├── store/               # Zustand stores
│   └── styles/              # Global styles
├── backend/                 # FastAPI backend
│   ├── app/                 # Application code
│   ├── services/            # Business logic
│   ├── models/              # Database models
│   └── routes/              # API routes
├── desktop/                 # Rust Tauri app
│   ├── src/                 # Rust source
│   └── tauri.conf.json      # Tauri config
├── shared/
│   ├── templates/           # JSON templates
│   └── types/               # TypeScript types
├── README.md
├── LICENSE
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Rust (for desktop app)

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/carousify
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SECRET_KEY=your_secret_key
```

### Desktop App Setup

```bash
cd desktop
cargo install tauri-cli
cargo tauri dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/{id}` - Get template by ID

### Export
- `POST /api/export/slice` - Slice image into carousel format
- `POST /api/export/zip` - Export as ZIP file

### AI Features
- `POST /api/ai/auto-crop` - Face detection auto-crop
- `POST /api/ai/remove-bg` - Background removal

## Template Structure

Templates are defined in JSON format:
```json
{
  "id": "template-001",
  "name": "3 Panel Grid",
  "layout": "3-panel",
  "slots": [
    {"x": 0, "y": 0, "width": 1016, "height": 1350},
    {"x": 1017, "y": 0, "width": 1016, "height": 1350},
    {"x": 2034, "y": 0, "width": 1016, "height": 1350}
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - Copyright (c) 2026 Manav Arya

## Author

Manav Arya
