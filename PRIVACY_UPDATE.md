# Privacy-Focused Update: Removed All URLs Permission

**Last Updated: August 3, 2025**

## What Changed

This extension has been updated to **remove the `<all_urls>` host permission** to improve user privacy and security. This means the extension can no longer access the URLs or content of your tabs.

## Removed Features

The following features were removed to eliminate the need for broad URL permissions:

- ❌ **Domain-based exclusions** - Can no longer exclude specific websites (gmail.com, github.com, etc.)
- ❌ **Media detection** - Can no longer detect tabs playing audio/video
- ❌ **URL tracking** - No longer stores or accesses tab URLs

## What Still Works

The extension maintains its core functionality with these privacy-friendly features:

- ✅ **Time-based tab expiration** - Automatically close tabs after inactivity
- ✅ **Pinned tab protection** - Never close pinned tabs
- ✅ **Configurable timeouts** - 5 minutes to 1 week expiration times
- ✅ **Statistics tracking** - Count of tracked and closed tabs
- ✅ **Battery efficiency** - Uses Chrome Alarms API for minimal resource usage

## Current Permissions

The extension now uses only these minimal permissions:

- `tabs` - Access basic tab information (creation, activation, removal)
- `storage` - Save your settings and statistics locally
- `alarms` - Schedule periodic cleanup checks
- `activeTab` - Interact with the currently active tab (unused currently)

## Privacy Benefits

- 🔒 **No URL access** - Extension cannot see which websites you visit
- 🔒 **No content access** - Cannot read page content or inject scripts
- 🔒 **Local storage only** - All data stays on your device
- 🔒 **Minimal tracking** - Only stores tab IDs, timestamps, and pinned status

## Alternative Solutions

If you need domain-based exclusions, consider these alternatives:

1. **Pin important tabs** - Pinned tabs are never closed automatically
2. **Adjust expiration times** - Use longer timeouts for tabs you use frequently
3. **Manual cleanup** - Use the "Clean up now" button when needed

## Migration Notes

If you were using domain exclusions in the previous version:

1. Your existing exclusion list will be ignored
2. Consider pinning tabs from important sites instead
3. Your other settings (expiration time, check frequency) remain unchanged

## Why This Change?

The `<all_urls>` permission is extremely broad and allows extensions to:

- Read and modify all your web pages
- Access sensitive information on any website
- Potentially track your browsing behavior

By removing this permission, the extension is now:

- More privacy-friendly
- Less likely to be flagged by security tools
- Compliant with principle of least privilege

This change prioritizes your privacy while maintaining the core tab management functionality that makes your browsing experience cleaner and more efficient.
