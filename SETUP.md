# Setup Guide - Expiring Tabs Chrome Extension

This guide will help you install and configure the Expiring Tabs Chrome extension.

## Quick Setup (5 minutes)

### Step 1: Generate Icons

1. Open `create-icons.html` in your web browser
2. Click "Generate All Icons"
3. Download each icon (right-click → Save image as):
   - Save as `icons/icon16.png`
   - Save as `icons/icon32.png`
   - Save as `icons/icon48.png`
   - Save as `icons/icon128.png`

### Step 2: Install Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `expiring_tabs` folder
5. The extension should now appear in your extensions list

### Step 3: Configure Settings

1. Click the extension icon in your Chrome toolbar
2. Toggle "Auto-close tabs" to ON
3. Set your preferred expiration time (default: 30 minutes)
4. Optionally add domains to exclude (like gmail.com, github.com)

## Verification

### Test the Extension

1. Open `verify-installation.js` in Chrome DevTools console
2. Run the verification script to check all functionality
3. Should show "PERFECT! Extension is fully functional"

### Manual Test

1. Open a few test tabs
2. Wait for the configured time OR click "Clean up now"
3. Inactive tabs should be closed automatically

## Troubleshooting

### Extension Not Working?

- ✅ Check it's enabled in `chrome://extensions/`
- ✅ Verify all 4 icon files exist in `icons/` folder
- ✅ Run the verification script
- ✅ Check browser console for errors

### Icons Missing?

- The extension needs icon16.png, icon32.png, icon48.png, icon128.png
- Use `create-icons.html` to generate them
- Save them in the `icons/` folder with exact filenames

### Tabs Not Closing?

- Make sure "Auto-close tabs" is enabled
- Check your expiration time isn't too long
- Pinned tabs are excluded by default
- Try "Clean up now" for immediate testing

## File Structure

```
expiring_tabs/
├── manifest.json          ← Extension configuration
├── background.js          ← Main logic (service worker)
├── popup.html/css/js      ← Quick settings popup
├── options.html/css/js    ← Detailed settings page
├── icons/                 ← Extension icons (you create these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── create-icons.html      ← Icon generator tool
├── verify-installation.js ← Testing script
└── README.md             ← Full documentation
```

## Default Settings

- **Expiration Time**: 30 minutes
- **Check Frequency**: Every 5 minutes
- **Exclude Pinned Tabs**: Yes
- **Excluded Domains**: None

## Battery Optimization

The extension is designed for minimal battery impact:

- Uses Chrome's efficient Alarms API (not timers)
- Only activates when needed
- Stores minimal data
- Service worker architecture

## Next Steps

1. **Customize Settings**: Right-click extension → Options for advanced settings
2. **Add Exclusions**: Add important domains you never want closed
3. **Adjust Timing**: Set expiration time based on your browsing habits
4. **Monitor Stats**: Check how many tabs are being cleaned up

## Need Help?

- Check the full `README.md` for detailed documentation
- Run `verify-installation.js` to diagnose issues
- Look for errors in Chrome DevTools console
- Make sure all files are in the correct locations

---

🎉 **You're all set!** The extension will now keep your browser clean and organized.
