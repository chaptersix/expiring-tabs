# Testing Checklist for Expiring Tabs Extension

## Pre-Submission Testing Checklist

### ✅ Installation & Setup
- [ ] Extension loads without errors in Chrome
- [ ] All icons display correctly (16x16, 32x32, 48x48, 128x128)
- [ ] Popup opens without JavaScript errors
- [ ] Options page opens and displays correctly
- [ ] Service worker starts without errors
- [ ] No console errors in any context

### ✅ Basic Functionality
- [ ] Extension can be enabled/disabled via popup toggle
- [ ] Settings are saved and persist after browser restart
- [ ] Tab tracking starts immediately after installation
- [ ] New tabs are automatically tracked
- [ ] Tab activity updates when switching between tabs
- [ ] Tab data is removed when tabs are closed manually

### ✅ Expiration Logic
- [ ] Default 4-hour expiration time is set correctly
- [ ] Can change expiration time (test 5 min, 1 hour, 24 hours)
- [ ] Pinned tabs are never closed (default behavior)
- [ ] Can toggle pinned tab protection on/off
- [ ] Active tab is never closed during cleanup
- [ ] Manual "Clean up now" works correctly
- [ ] Automatic cleanup runs on schedule

### ✅ Edge Cases
- [ ] Works with 0 open tabs
- [ ] Works with 50+ open tabs
- [ ] Handles tabs opened in new windows
- [ ] Handles tabs opened in incognito mode
- [ ] Survives browser restart/extension reload
- [ ] Handles rapid tab opening/closing
- [ ] Works when computer goes to sleep/wake
- [ ] Handles extension being disabled then re-enabled

### ✅ Settings & Configuration
- [ ] All expiration time options work (5 min to 1 week)
- [ ] Check frequency changes take effect immediately
- [ ] Settings export creates valid JSON file
- [ ] Settings import works with exported file
- [ ] Invalid import file shows error message
- [ ] Settings reset to defaults when corrupted

### ✅ Statistics
- [ ] Tab count displays correctly in popup
- [ ] Statistics update in real-time
- [ ] Daily stats reset at midnight
- [ ] Total stats persist across sessions
- [ ] Stats reset function works
- [ ] Stats display correctly in options page

### ✅ User Interface
- [ ] Popup fits properly without scrolling
- [ ] All buttons are clickable and responsive
- [ ] Toggle switches work smoothly
- [ ] Dropdown menus show all options
- [ ] Status indicators update correctly
- [ ] Options page layouts properly on different screen sizes
- [ ] Form inputs accept valid values only

### ✅ Performance
- [ ] Extension doesn't slow down browser startup
- [ ] Memory usage remains stable over time
- [ ] Service worker doesn't stay active unnecessarily
- [ ] No excessive CPU usage during idle periods
- [ ] Cleanup operations complete quickly
- [ ] Large numbers of tabs don't cause lag

### ✅ Privacy & Security
- [ ] No URLs are logged or stored
- [ ] No external network requests are made
- [ ] All data stays in local storage
- [ ] No sensitive information in console logs
- [ ] Extension works completely offline
- [ ] Data is cleaned up on uninstall

### ✅ Cross-Platform Testing
- [ ] Works on Windows Chrome
- [ ] Works on macOS Chrome
- [ ] Works on Linux Chrome
- [ ] Works on ChromeOS
- [ ] Compatible with latest Chrome version
- [ ] Compatible with Chrome Beta (if available)

### ✅ Debugging Features
- [ ] Debug helpers load without errors
- [ ] `debugHelpers.getAllTrackedTabs()` works
- [ ] `debugHelpers.getCurrentTabs()` works
- [ ] `debugHelpers.compareTrackedVsActual()` works
- [ ] `debugHelpers.getTabAges()` works
- [ ] `debugHelpers.dryRunCleanup()` works
- [ ] `keepAlive.start()` keeps service worker active
- [ ] All debug commands produce expected output

### ✅ Error Handling
- [ ] Graceful handling of corrupted storage data
- [ ] Recovery from Chrome API errors
- [ ] Proper error messages for user-facing issues
- [ ] No unhandled promise rejections
- [ ] Service worker restarts after crashes
- [ ] Extension continues working after Chrome updates

### ✅ Real-World Usage Testing
- [ ] Use extension for 24 hours with normal browsing
- [ ] Open 20+ tabs and let them expire naturally
- [ ] Test with heavy tab usage (100+ tabs)
- [ ] Test with various website types (social, work, entertainment)
- [ ] Verify no important tabs are accidentally closed
- [ ] Confirm battery usage is reasonable

### ✅ Store Preparation
- [ ] All required icons are present and correct size
- [ ] Privacy policy is complete and accurate
- [ ] Store listing description is compelling
- [ ] Screenshots show key features clearly
- [ ] Version number matches in all files
- [ ] LICENSE file is present and correct
- [ ] README is up-to-date and comprehensive

## Test Scenarios

### Scenario 1: New User Experience
1. Install extension fresh
2. Open popup - should show default 4-hour setting
3. Open 5 tabs, wait 1 minute
4. Change setting to 1 minute expiration
5. Wait 2 minutes, verify 4 tabs are closed (active tab remains)

### Scenario 2: Power User Setup
1. Open options page
2. Set expiration to 8 hours
3. Set check frequency to 15 minutes
4. Add some domain exclusions (should be removed in privacy version)
5. Export settings
6. Reset extension
7. Import settings back
8. Verify all settings restored

### Scenario 3: Heavy Usage
1. Open 50 tabs quickly
2. Switch between tabs randomly for 10 minutes
3. Pin 3 tabs
4. Set expiration to 5 minutes
5. Wait 6 minutes
6. Verify only unpinned, inactive tabs are closed
7. Verify pinned tabs remain open

### Scenario 4: Browser Restart
1. Set up extension with custom settings
2. Open several tabs with different ages
3. Close and restart Chrome
4. Verify extension resumes tracking correctly
5. Verify existing tabs are properly tracked
6. Verify settings are preserved

## Pass/Fail Criteria

### Must Pass (Blocking Issues)
- Extension installs without errors
- Basic tab cleanup functionality works
- No JavaScript console errors
- Settings are saved and restored
- Privacy policy compliance (no URL access)
- Service worker starts correctly

### Should Pass (Important Issues)
- All UI elements work correctly
- Statistics display accurately
- Export/import functions work
- Performance is acceptable
- Cross-platform compatibility

### Nice to Have (Minor Issues)
- Debug helpers all function
- Advanced edge cases handled gracefully
- Optimal performance under heavy load

## Bug Report Template

**Issue:** Brief description
**Steps to Reproduce:**
1. Step one
2. Step two
3. Expected vs actual result

**Environment:**
- Chrome Version:
- OS:
- Extension Version:
- Console Errors:

**Severity:** Critical/High/Medium/Low
**Status:** Open/In Progress/Fixed/Won't Fix
