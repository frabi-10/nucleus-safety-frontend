# Development Guide - Nucleus Safety Reporting System

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running (default: http://localhost:3001)

### Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update:
   - `REACT_APP_API_URL` - Your backend API URL
   - `REACT_APP_REPORTS_PASSWORD` - Password for viewing reports (change for production!)

3. **Start development server**
   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

### Testing Branch

You're currently on the `development` branch for testing. This allows you to:
- Test all changes locally
- Verify functionality before merging to main
- Roll back if needed

### Recent Improvements (Quick Polish)

✅ **Security**
- Removed hardcoded password
- Added environment variable support
- Added `.env.example` for documentation

✅ **UX Enhancements**
- Replaced browser alerts with elegant toast notifications
- Added loading states and spinners
- Improved error handling with retry buttons
- Better empty states with helpful messages

✅ **Responsive Design**
- Mobile-friendly navigation with hamburger menu
- Responsive layouts for all screen sizes
- Touch-friendly buttons and controls

✅ **UI Polish**
- Smooth transitions and animations
- Hover effects on interactive elements
- Custom scrollbar styling
- Better focus states for accessibility
- Improved button states (loading, disabled)

✅ **Code Quality**
- Better error handling throughout
- Cleaner state management
- Added helpful comments
- Removed unused code

### Testing Checklist

Before merging to main, test:

- [ ] Submit a new safety report
- [ ] View reports (password protected)
- [ ] Add comments to a report
- [ ] Change report status
- [ ] Assign report to someone
- [ ] View analytics dashboard
- [ ] Test on mobile device (or browser dev tools)
- [ ] Test all toast notifications appear correctly
- [ ] Verify loading states work
- [ ] Test error states (disconnect backend to simulate)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Merging to Main

Once testing is complete:

```bash
git checkout main
git merge development
git push origin main
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:3001` |
| `REACT_APP_REPORTS_PASSWORD` | Client-side password for reports | `nucleus2024` |

**⚠️ IMPORTANT SECURITY NOTES:**
1. Client-side password protection is NOT secure for production
2. Implement proper server-side authentication
3. Never commit `.env` file to version control
4. Change default password immediately

### Troubleshooting

**Problem: Can't connect to backend**
- Verify backend is running
- Check `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors

**Problem: Toast notifications not showing**
- Check browser console for errors
- Verify the action completed successfully

**Problem: Mobile menu not working**
- Clear browser cache
- Verify you're on the development branch

### Next Steps (Future Improvements)

Consider these for a future update:
- Add unit tests
- Implement pagination for large report lists
- Add export functionality (PDF/Excel)
- Real authentication system
- Image optimization
- Component splitting for better code organization

---

**Questions?** Contact the development team or check the main README.md
