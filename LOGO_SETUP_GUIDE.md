# 📱 App Logo Setup Guide

## Icon Requirements

### For iOS:
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Transparency**: Not allowed (must have background)
- **File**: `assets/images/icon.png`

### For Android:
- **Size**: 1024x1024 pixels (foreground only)
- **Format**: PNG
- **Transparency**: Allowed
- **Background**: Configured in `app.json`
- **File**: `assets/images/adaptive-icon.png`

### For Splash Screen:
- **Size**: Recommended 200-400px width/height
- **Format**: PNG
- **File**: `assets/images/splash-icon.png`

## Steps to Add Your Logo:

1. **Prepare your logo files:**
   - Create or resize your logo to 1024x1024 pixels
   - Save as PNG files

2. **Replace existing icons:**
   - Replace `assets/images/icon.png` with your iOS icon (1024x1024, no transparency)
   - Replace `assets/images/adaptive-icon.png` with your Android icon (1024x1024, transparency OK)
   - Replace `assets/images/splash-icon.png` with your splash screen icon (200-400px recommended)

3. **Update app.json** (already configured, but you can adjust):
   - `icon`: Main app icon (iOS)
   - `android.adaptiveIcon.foregroundImage`: Android adaptive icon
   - `android.adaptiveIcon.backgroundColor`: Background color for Android icon
   - `plugins[expo-splash-screen].image`: Splash screen icon

4. **Rebuild your app:**
   ```bash
   eas build --platform android --profile apk
   eas build --platform ios --profile production
   ```

## Quick Setup Using Your Existing Logo:

If `assets/images/dream_logo.png` is your logo:
1. Resize it to 1024x1024 for icons
2. Copy/resize it to 200-400px for splash screen
3. Replace the existing icon files

## Testing:

After updating, you can test locally:
```bash
npx expo prebuild --clean
npx expo run:android
```

Your current configuration in `app.json`:
- ✅ Icon path: `./assets/images/icon.png`
- ✅ Android adaptive icon: `./assets/images/adaptive-icon.png`
- ✅ Splash screen: `./assets/images/splash-icon.png`

Just replace these files with your logo files!

