# Nucleus Safety - Reporting System

A modern, feature-rich React application for managing workplace safety reports at Nucleus Biologics.

## 🚀 Features

### Public Features
- **Submit Safety Report** - Easy-to-use form for reporting safety concerns
- **QR Code Integration** - Location-specific QR codes for quick reporting

### Protected Features (Password Required)
- **View Reports** - Browse, filter, search, and manage all safety reports
- **Analytics Dashboard** - Comprehensive statistics and visualizations
- **Assigned Reports** - Task management view
- **QR Code Generator** - Generate printable QR codes

## 🛠️ Tech Stack

- **React 18.3** + **Vite 5.4** ⚡
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management
- **Tailwind CSS 3.4** - Styling
- **React Hook Form** + **Zod** - Forms & validation

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install --ignore-scripts
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

## 🔐 Default Password

**Password:** `nucleus2024`

Change it in `.env` → `VITE_REPORTS_PASSWORD`

## 📝 Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview build
- `npm run lint` - Run ESLint

## 📁 Structure

```
src/
├── features/        # Feature modules
├── components/ui/   # Reusable components
├── hooks/          # Custom hooks
├── services/       # API layer
├── utils/          # Helpers & constants
└── contexts/       # React contexts
```

## 🌐 API Endpoints

- `GET /api/reports` - Fetch reports
- `POST /api/reports` - Create report
- `PUT /api/reports/:id` - Update report
- `GET /api/stats` - Analytics

Backend should run on `http://localhost:3001`

---

**Built with ❤️ using React + Vite**
