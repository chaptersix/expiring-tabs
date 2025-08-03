# Expiring Tabs - Chrome Extension

🧹 **Keep your browser clean and organized** by automatically closing inactive tabs after a configured period of time.

## Features

- ⏰ **Configurable expiration time** - Set tabs to close after 5 minutes to 1 week of inactivity
- 📌 **Smart exclusions** - Never close pinned tabs or specific domains
- 🔋 **Battery efficient** - Uses Chrome's alarm API for minimal battery impact
- 📊 **Statistics tracking** - Monitor how many tabs have been cleaned up
- ⚙️ **Flexible settings** - Customize check frequency and exclusion rules
- 🎯 **Simple interface** - Easy-to-use popup and detailed options page

## Installation

### From Chrome Web Store (Recommended)

_Coming soon - extension pending review_

### Manual Installation (Developer Mode)

1. **Download or clone this repository**

   ```bash
   git clone https://github.com/your-username/expiring-tabs.git
   ```

2. **Open Chrome Extensions page**
   - Go to `chrome://extensions/`
   - Or click Chrome menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `expiring_tabs` folder

5. **Pin the extension** (optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Pin "Expiring Tabs" for easy access

## Usage

### Quick Setup

1. **Click the extension icon** in your toolbar
2. **Toggle "Auto-close tabs"** to enable the extension
3. **Set expiration time** (default: 30 minutes)
4. **Configure exclusions** as needed

### Advanced Settings

1. **Right-click the extension icon** → Options
2. Or click "More settings" in the popup
3. Configure:
   - Check frequency (how often to scan for expired tabs)
   - Excluded domains (sites that should never be closed)
   - Additional exclusion rules

### Manual Cleanup

- Click **"Clean up now"** in the popup to immediately close expired tabs
- Useful for testing your settings or quick cleanup

## How It Works

### Battery Efficient Design

- Uses **Chrome Alarms API** instead of continuous background timers
- Only activates when necessary (tab creation, activation, or scheduled checks)
- Stores minimal data using Chrome's storage API
- Service worker architecture minimizes memory usage

### Tab Tracking

- Tracks when tabs are created and last accessed
- Updates activity timestamp when you switch to or interact with tabs
- Respects browser navigation and page changes

### Smart Exclusions

- **Pinned tabs** - Never closed by default
- **Active tabs** - Currently focused tab is never closed
- **Recent activity** - Only closes tabs that haven't been used for the configured time

## Configuration Options

| Setting             | Description                              | Default    |
| ------------------- | ---------------------------------------- | ---------- |
| **Expiration Time** | How long tabs stay open without activity | 30 minutes |
| **Check Frequency** | How often to scan for expired tabs       | 5 minutes  |
| **Exclude Pinned**  | Never close pinned tabs                  | Enabled    |

## Permissions Explained

The extension requires these minimal permissions:

- **`tabs`** - Read basic tab information and close expired tabs
- **`storage`** - Save your settings and track tab activity locally
- **`alarms`** - Schedule efficient background checks
- **`activeTab`** - Reserved for future features (currently unused)

## Privacy & Security

- **🔒 No URL access** - Extension cannot see which websites you visit
- **🔒 No content access** - Cannot read page content or inject scripts
- **🔒 No data collection** - All data stays on your device
- **🔒 No network requests** - Extension works entirely offline
- **🔒 No analytics** - Your browsing habits are not tracked
- **🔒 Local storage only** - Settings and tab data stored locally in Chrome

## Troubleshooting

### Extension not closing tabs?

1. Check that the extension is **enabled** in the popup
2. Verify your **expiration time** isn't too long
3. Make sure tabs aren't **pinned** (pinned tabs are protected)
4. Try **"Clean up now"** to test immediately

## Privacy-Focused Design

This extension prioritizes your privacy by:

- **No URL permissions** - Cannot access what websites you visit
- **Minimal data collection** - Only tracks tab IDs, timestamps, and pinned status
- **Local processing** - All logic runs locally on your device

If you need to protect specific sites, consider **pinning those tabs** instead of relying on domain exclusions.

### High battery usage?

1. Increase the **check frequency** (check less often)
2. Use longer **expiration times**
3. The extension is designed to be efficient, but checking every minute uses more resources than checking every 30 minutes

### Tabs closing too quickly?

1. Increase the **expiration time**
2. Add frequently used sites to **excluded domains**
3. Pin important tabs to prevent closure

## Development

### Project Structure

```
expiring_tabs/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (main logic)
├── popup.html/css/js      # Extension popup interface
├── options.html/css/js    # Settings page
├── icons/                 # Extension icons
└── README.md             # This file
```

### Key Files

- **`background.js`** - Core tab management logic
- **`popup.js`** - Quick settings interface
- **`options.js`** - Advanced settings page

### Building

No build process required - this is a pure JavaScript extension that runs directly in Chrome.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Report issues**: [GitHub Issues](https://github.com/your-username/expiring-tabs/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/your-username/expiring-tabs/discussions)
- **Rate the extension**: [Chrome Web Store](https://chrome.google.com/webstore/detail/expiring-tabs/your-extension-id)

## Changelog

### v1.0.0 (Privacy-Focused Release)

- ✨ Automatic tab expiration with configurable timing
- 📌 Pinned tab exclusion
- 🔒 Privacy-first design with minimal permissions
- ⚙️ Popup and options page interfaces
- 📊 Basic statistics tracking
- 🔋 Battery-efficient background processing

---

**Made with ❤️ for a cleaner browsing experience**
