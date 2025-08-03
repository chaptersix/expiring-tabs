// Installation verification script for Expiring Tabs extension
// Run this in the browser console to verify the extension is working correctly

(function() {
    'use strict';

    const EXTENSION_NAME = 'Expiring Tabs';
    const REQUIRED_PERMISSIONS = ['tabs', 'storage', 'alarms', 'activeTab'];

    console.log(`🔍 ${EXTENSION_NAME} - Installation Verification`);
    console.log('=' .repeat(50));

    // Check if Chrome extension APIs are available
    function checkChromeAPIs() {
        console.log('\n📋 Checking Chrome Extension APIs...');

        const apis = {
            'chrome.tabs': !!chrome.tabs,
            'chrome.storage': !!chrome.storage,
            'chrome.alarms': !!chrome.alarms,
            'chrome.runtime': !!chrome.runtime,
            'chrome.action': !!chrome.action
        };

        let allPresent = true;
        for (const [api, available] of Object.entries(apis)) {
            const status = available ? '✅' : '❌';
            console.log(`  ${status} ${api}: ${available ? 'Available' : 'Missing'}`);
            if (!available) allPresent = false;
        }

        return allPresent;
    }

    // Check if the extension is installed and active
    async function checkExtensionStatus() {
        console.log('\n🔌 Checking Extension Status...');

        try {
            // Try to get extension info
            const manifest = chrome.runtime.getManifest();
            if (manifest && manifest.name.includes('Expiring Tabs')) {
                console.log(`  ✅ Extension installed: ${manifest.name} v${manifest.version}`);
                return true;
            } else {
                console.log('  ❌ Extension not found or name mismatch');
                return false;
            }
        } catch (error) {
            console.log('  ❌ Extension not accessible:', error.message);
            return false;
        }
    }

    // Check permissions
    async function checkPermissions() {
        console.log('\n🔐 Checking Permissions...');

        try {
            const permissions = await chrome.permissions.getAll();
            const hasPermissions = REQUIRED_PERMISSIONS.every(perm =>
                permissions.permissions.includes(perm)
            );

            REQUIRED_PERMISSIONS.forEach(perm => {
                const hasIt = permissions.permissions.includes(perm);
                const status = hasIt ? '✅' : '❌';
                console.log(`  ${status} ${perm}: ${hasIt ? 'Granted' : 'Missing'}`);
            });

            return hasPermissions;
        } catch (error) {
            console.log('  ❌ Could not check permissions:', error.message);
            return false;
        }
    }

    // Check storage access
    async function checkStorage() {
        console.log('\n💾 Checking Storage Access...');

        try {
            // Test local storage
            await chrome.storage.local.set({test: 'verification'});
            const result = await chrome.storage.local.get('test');
            await chrome.storage.local.remove('test');

            if (result.test === 'verification') {
                console.log('  ✅ Local storage: Working');
            } else {
                console.log('  ❌ Local storage: Failed');
                return false;
            }

            // Test sync storage
            await chrome.storage.sync.set({test: 'verification'});
            const syncResult = await chrome.storage.sync.get('test');
            await chrome.storage.sync.remove('test');

            if (syncResult.test === 'verification') {
                console.log('  ✅ Sync storage: Working');
            } else {
                console.log('  ❌ Sync storage: Failed');
                return false;
            }

            return true;
        } catch (error) {
            console.log('  ❌ Storage access failed:', error.message);
            return false;
        }
    }

    // Check alarm functionality
    async function checkAlarms() {
        console.log('\n⏰ Checking Alarm Functionality...');

        try {
            // Create a test alarm
            await chrome.alarms.create('test-alarm', {delayInMinutes: 0.1});

            // Check if alarm was created
            const alarm = await chrome.alarms.get('test-alarm');
            if (alarm) {
                console.log('  ✅ Alarm creation: Working');
                // Clean up
                await chrome.alarms.clear('test-alarm');
                return true;
            } else {
                console.log('  ❌ Alarm creation: Failed');
                return false;
            }
        } catch (error) {
            console.log('  ❌ Alarm functionality failed:', error.message);
            return false;
        }
    }

    // Check tabs access
    async function checkTabsAccess() {
        console.log('\n📑 Checking Tabs Access...');

        try {
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            if (tabs && tabs.length > 0) {
                console.log(`  ✅ Tabs query: Working (found ${tabs.length} active tab)`);
                return true;
            } else {
                console.log('  ❌ Tabs query: No tabs found');
                return false;
            }
        } catch (error) {
            console.log('  ❌ Tabs access failed:', error.message);
            return false;
        }
    }

    // Test extension messaging
    async function checkMessaging() {
        console.log('\n💬 Checking Extension Messaging...');

        try {
            // Try to send a message to the background script
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({action: 'getSettings'}, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });

            if (response) {
                console.log('  ✅ Background script communication: Working');
                console.log(`  📊 Extension enabled: ${response.enabled || false}`);
                console.log(`  ⏱️  Expire time: ${response.expireMinutes || 'unknown'} minutes`);
                return true;
            } else {
                console.log('  ❌ Background script communication: No response');
                return false;
            }
        } catch (error) {
            console.log('  ❌ Background script communication failed:', error.message);
            return false;
        }
    }

    // Generate installation report
    function generateReport(results) {
        console.log('\n📊 Installation Report');
        console.log('=' .repeat(30));

        const totalChecks = Object.keys(results).length;
        const passedChecks = Object.values(results).filter(Boolean).length;
        const score = (passedChecks / totalChecks * 100).toFixed(1);

        console.log(`Score: ${passedChecks}/${totalChecks} (${score}%)`);

        if (score === '100.0') {
            console.log('🎉 PERFECT! Extension is fully functional');
        } else if (score >= '80.0') {
            console.log('✅ GOOD: Extension should work with minor issues');
        } else if (score >= '60.0') {
            console.log('⚠️  PARTIAL: Extension may have functionality issues');
        } else {
            console.log('❌ FAILED: Extension installation has serious problems');
        }

        console.log('\n🛠️  Troubleshooting Tips:');

        if (!results.chromeAPIs) {
            console.log('• Chrome extension APIs not available - are you running this in a Chrome extension context?');
        }

        if (!results.extensionStatus) {
            console.log('• Extension not found - make sure it\'s installed and enabled in chrome://extensions/');
        }

        if (!results.permissions) {
            console.log('• Missing permissions - the extension may not have been granted necessary permissions');
        }

        if (!results.storage) {
            console.log('• Storage issues - check if Chrome has sufficient disk space and permissions');
        }

        if (!results.alarms) {
            console.log('• Alarm functionality broken - this may affect automatic tab cleanup');
        }

        if (!results.tabsAccess) {
            console.log('• Cannot access tabs - check permissions and make sure tabs exist');
        }

        if (!results.messaging) {
            console.log('• Background script not responding - extension may not be properly loaded');
        }

        console.log('\n📖 For more help, check the README.md file or report issues on GitHub');
    }

    // Main verification function
    async function runVerification() {
        try {
            const results = {
                chromeAPIs: checkChromeAPIs(),
                extensionStatus: await checkExtensionStatus(),
                permissions: await checkPermissions(),
                storage: await checkStorage(),
                alarms: await checkAlarms(),
                tabsAccess: await checkTabsAccess(),
                messaging: await checkMessaging()
            };

            generateReport(results);

            return results;
        } catch (error) {
            console.error('🚨 Verification failed with error:', error);
            console.log('\n💡 Make sure you\'re running this in a context where Chrome extension APIs are available');
            console.log('   (e.g., in the extension\'s popup, options page, or background script console)');
        }
    }

    // Auto-run verification
    runVerification().then(() => {
        console.log('\n✨ Verification complete! Check the results above.');
    });

})();
