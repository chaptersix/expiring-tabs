// Popup JavaScript for Expiring Tabs extension
class PopupManager {
    constructor() {
        this.elements = {};
        this.settings = {};
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSettings();
        this.updateTabStats();
    }

    bindElements() {
        this.elements = {
            statusDot: document.getElementById('status-dot'),
            statusText: document.getElementById('status-text'),
            enabledToggle: document.getElementById('enabled-toggle'),
            expireTime: document.getElementById('expire-time'),
            excludePinned: document.getElementById('exclude-pinned'),
            tabCount: document.getElementById('tab-count'),
            cleanupNow: document.getElementById('cleanup-now'),
            openOptions: document.getElementById('open-options')
        };
    }

    bindEvents() {
        // Toggle enabled state
        this.elements.enabledToggle.addEventListener('change', (e) => {
            this.updateSetting('enabled', e.target.checked);
            this.updateStatus();
        });

        // Change expire time
        this.elements.expireTime.addEventListener('change', (e) => {
            this.updateSetting('expireMinutes', parseInt(e.target.value));
        });

        // Toggle exclude pinned tabs
        this.elements.excludePinned.addEventListener('change', (e) => {
            this.updateSetting('excludePinned', e.target.checked);
        });

        // Cleanup now button
        this.elements.cleanupNow.addEventListener('click', () => {
            this.cleanupNow();
        });

        // Open options page
        this.elements.openOptions.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }

    async loadSettings() {
        try {
            const response = await this.sendMessage({action: 'getSettings'});
            this.settings = response;
            this.updateUI();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showError('Failed to load settings');
        }
    }

    updateUI() {
        // Update enabled toggle
        this.elements.enabledToggle.checked = this.settings.enabled;

        // Update expire time select
        this.elements.expireTime.value = this.settings.expireMinutes.toString();

        // Update exclude pinned checkbox
        this.elements.excludePinned.checked = this.settings.excludePinned;

        // Update status indicator
        this.updateStatus();

        // Enable/disable controls based on enabled state
        this.updateControlsState();
    }

    updateStatus() {
        const isEnabled = this.settings.enabled;

        this.elements.statusDot.classList.toggle('enabled', isEnabled);
        this.elements.statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
    }

    updateControlsState() {
        const isEnabled = this.settings.enabled;

        this.elements.expireTime.disabled = !isEnabled;
        this.elements.excludePinned.disabled = !isEnabled;
        this.elements.cleanupNow.disabled = !isEnabled;
    }

    async updateSetting(key, value) {
        try {
            this.settings[key] = value;

            const response = await this.sendMessage({
                action: 'updateSettings',
                settings: {[key]: value}
            });

            if (!response.success) {
                throw new Error(response.error);
            }

            this.updateStatus();
            this.updateControlsState();
        } catch (error) {
            console.error('Error updating setting:', error);
            this.showError('Failed to save settings');
        }
    }

    async updateTabStats() {
        try {
            const response = await this.sendMessage({action: 'getTabStats'});
            this.elements.tabCount.textContent = response.tabCount;
        } catch (error) {
            console.error('Error getting tab stats:', error);
            this.elements.tabCount.textContent = '?';
        }
    }

    async cleanupNow() {
        if (!this.settings.enabled) {
            this.showMessage('Extension is disabled');
            return;
        }

        try {
            // Disable button and show loading state
            this.elements.cleanupNow.disabled = true;
            this.elements.cleanupNow.textContent = 'Cleaning up...';
            this.elements.cleanupNow.classList.add('loading');

            const response = await this.sendMessage({action: 'cleanupNow'});

            if (response.success) {
                this.showMessage('Cleanup completed');
                // Refresh tab stats
                setTimeout(() => this.updateTabStats(), 500);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
            this.showError('Cleanup failed');
        } finally {
            // Re-enable button
            this.elements.cleanupNow.disabled = false;
            this.elements.cleanupNow.textContent = 'Clean up now';
            this.elements.cleanupNow.classList.remove('loading');
        }
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
    }

    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add toast styles if not already present
        if (!document.querySelector('.toast-styles')) {
            const style = document.createElement('style');
            style.className = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 8px 12px;
                    border-radius: 4px;
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }
                .toast-info { background: #667eea; }
                .toast-error { background: #ff4757; }
                .toast-success { background: #2ed573; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Refresh tab stats when popup becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Small delay to ensure popup is fully loaded
        setTimeout(() => {
            if (window.popupManager) {
                window.popupManager.updateTabStats();
            }
        }, 100);
    }
});
