# Testing Guide - Development Branch

## 🚀 Quick Start Testing

You're on the `development` branch. Follow these steps to test locally:

### 1. Setup (First Time Only)

```bash
# Install dependencies if you haven't
npm install

# Create environment file
cp .env.example .env

# Optional: Edit .env to customize settings
# nano .env
```

### 2. Start the Application

```bash
# Start the frontend (opens http://localhost:3000)
npm start
```

**⚠️ Important:** Make sure your backend API is running on `http://localhost:3001` (or update `.env` with the correct URL)

---

## ✅ Testing Checklist

### Basic Functionality

**Submit Report Tab**
- [ ] Fill out all required fields (Type, Location, Area, Description)
- [ ] Select different priority levels
- [ ] Upload a photo (both camera and file upload)
- [ ] Submit the form
- [ ] Verify toast notification appears (green success message)
- [ ] Check form clears after submission

**View Reports Tab (Password: nucleus2024)**
- [ ] Click "View Reports" tab
- [ ] Enter password when prompted
- [ ] Verify reports list loads
- [ ] Check loading spinner appears while loading
- [ ] Click on a report to expand details
- [ ] Add a comment (name + message)
- [ ] Verify comment toast notification
- [ ] Change report status (Open → In Progress → Resolved)
- [ ] Verify status update toast notification
- [ ] Assign report to someone
- [ ] Verify assignment toast notification
- [ ] Test "Clear All" button (⚠️ deletes everything!)

**Assigned Reports Tab**
- [ ] Click "Assigned" tab
- [ ] Verify only assigned reports show
- [ ] Check table displays correctly
- [ ] Click on a report to view details

**Analytics Tab**
- [ ] Click "Analytics" tab
- [ ] Verify all charts load correctly
- [ ] Check summary cards show correct data
- [ ] Verify charts are responsive

### Mobile Testing

**Responsive Design**
- [ ] Open browser dev tools (F12)
- [ ] Switch to mobile view (iPhone/Android)
- [ ] Click hamburger menu (☰) in header
- [ ] Verify mobile menu appears
- [ ] Navigate between tabs
- [ ] Test form on mobile
- [ ] Verify buttons are touch-friendly
- [ ] Check all content is readable

### UX Improvements

**Toast Notifications** (should appear in top-right)
- [ ] Success messages (green) for successful actions
- [ ] Error messages (red) for failures
- [ ] Notifications auto-dismiss after 4 seconds

**Loading States**
- [ ] Spinner shows when loading reports
- [ ] Submit button shows spinner when submitting
- [ ] Buttons disable during operations

**Error Handling**
- [ ] Stop backend API temporarily
- [ ] Try to load reports
- [ ] Verify error message appears
- [ ] Click "Try Again" button
- [ ] Restart backend and verify it works

**Animations & Polish**
- [ ] Toast notifications slide in from right
- [ ] Mobile menu fades in
- [ ] Buttons have hover effects
- [ ] Form inputs have focus states
- [ ] Smooth transitions throughout

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to load reports"
**Solution:**
1. Check backend is running
2. Verify `REACT_APP_API_URL` in `.env`
3. Check browser console for CORS errors

### Issue: Password not working
**Solution:**
- Default password is `nucleus2024`
- Check `.env` file if you changed it

### Issue: Toast notifications not appearing
**Solution:**
- Check browser console for errors
- Try refreshing the page
- Verify action completed successfully

### Issue: Mobile menu not opening
**Solution:**
- Refresh the page
- Clear browser cache
- Make sure you're on development branch

---

## 📊 What to Look For

### Good Signs ✅
- Clean, professional UI
- Smooth animations
- Toast notifications instead of alerts
- Mobile menu works perfectly
- Loading states show appropriately
- Error messages are helpful
- All features work as expected

### Red Flags 🚩
- Browser alerts (should be toasts now)
- UI breaking on mobile
- Charts not loading
- Slow loading without indicators
- Errors in browser console

---

## 📝 Notes for Production

Before merging to main:

1. **Security**
   - Change default password in `.env`
   - Implement real authentication on backend
   - Never commit `.env` file

2. **Performance**
   - Run `npm run build` to verify build succeeds
   - Test production build locally
   - Check bundle size

3. **Final Checks**
   - All tests pass ✅
   - No console errors
   - Works on mobile
   - Backend is ready

---

## 🎯 Next Steps

After testing successfully:

### Merge to Main
```bash
git checkout main
git merge development
git push origin main
```

### Deploy
Follow your deployment process (Vercel, Netlify, etc.)

---

## 📞 Need Help?

- Check browser console for errors (F12)
- Review DEVELOPMENT.md for setup details
- Verify backend is running and accessible
- Check all environment variables are set

Happy testing! 🚀
