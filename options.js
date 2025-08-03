// Options page JavaScript for Expiring Tabs extension
class OptionsManager {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.stats = {};
    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.loadSettings();
    this.loadStats();
  }

  bindElements() {
    this.elements = {
      enabledToggle: document.getElementById("enabled-toggle"),
      expireTime: document.getElementById("expire-time"),
      checkInterval: document.getElementById("check-interval"),
      excludePinned: document.getElementById("exclude-pinned"),

      trackedTabs: document.getElementById("tracked-tabs"),
      closedToday: document.getElementById("closed-today"),
      totalClosed: document.getElementById("total-closed"),
      cleanupNow: document.getElementById("cleanup-now"),
      resetStats: document.getElementById("reset-stats"),
      exportSettings: document.getElementById("export-settings"),
      importSettings: document.getElementById("import-settings"),
      importFile: document.getElementById("import-file"),
      viewSource: document.getElementById("view-source"),
      reportIssue: document.getElementById("report-issue"),
      rateExtension: document.getElementById("rate-extension"),
      statusMessage: document.getElementById("status-message"),
    };
  }

  bindEvents() {
    // Setting changes
    this.elements.enabledToggle.addEventListener("change", (e) => {
      this.updateSetting("enabled", e.target.checked);
    });

    this.elements.expireTime.addEventListener("change", (e) => {
      this.updateSetting("expireMinutes", parseInt(e.target.value));
    });

    this.elements.checkInterval.addEventListener("change", (e) => {
      this.updateSetting("checkInterval", parseInt(e.target.value));
    });

    this.elements.excludePinned.addEventListener("change", (e) => {
      this.updateSetting("excludePinned", e.target.checked);
    });

    // Action buttons
    this.elements.cleanupNow.addEventListener("click", () => {
      this.cleanupNow();
    });

    this.elements.resetStats.addEventListener("click", () => {
      this.resetStats();
    });

    this.elements.exportSettings.addEventListener("click", () => {
      this.exportSettings();
    });

    this.elements.importSettings.addEventListener("click", () => {
      this.elements.importFile.click();
    });

    this.elements.importFile.addEventListener("change", (e) => {
      this.importSettings(e.target.files[0]);
    });

    // Footer links
    this.elements.viewSource.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({
        url: "https://github.com/chaptersix/expiring-tabs",
      });
    });

    this.elements.reportIssue.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({
        url: "https://github.com/chaptersix/expiring-tabs/issues",
      });
    });

    this.elements.rateExtension.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({
        url: "https://chrome.google.com/webstore/detail/expiring-tabs/your-extension-id",
      });
    });
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ action: "getSettings" });
      this.settings = response;
      this.updateUI();
    } catch (error) {
      console.error("Error loading settings:", error);
      this.showMessage("Failed to load settings", "error");
    }
  }

  async loadStats() {
    try {
      // Get tracked tabs count
      const tabStatsResponse = await this.sendMessage({
        action: "getTabStats",
      });
      this.stats.trackedTabs = tabStatsResponse.tabCount;

      // Get other stats from storage
      const statsData = await chrome.storage.local.get({
        closedToday: 0,
        totalClosed: 0,
        lastResetDate: new Date().toDateString(),
      });

      // Reset daily stats if it's a new day
      const today = new Date().toDateString();
      if (statsData.lastResetDate !== today) {
        await chrome.storage.local.set({
          closedToday: 0,
          lastResetDate: today,
        });
        this.stats.closedToday = 0;
      } else {
        this.stats.closedToday = statsData.closedToday;
      }

      this.stats.totalClosed = statsData.totalClosed;
      this.updateStatsUI();
    } catch (error) {
      console.error("Error loading stats:", error);
      this.updateStatsUI();
    }
  }

  updateUI() {
    // Update form inputs
    this.elements.enabledToggle.checked = this.settings.enabled;
    this.elements.expireTime.value = this.settings.expireMinutes.toString();
    this.elements.checkInterval.value = this.settings.checkInterval.toString();
    this.elements.excludePinned.checked = this.settings.excludePinned;

    // Update control states
    this.updateControlsState();
  }

  updateStatsUI() {
    this.elements.trackedTabs.textContent = this.stats.trackedTabs || "-";
    this.elements.closedToday.textContent = this.stats.closedToday || "0";
    this.elements.totalClosed.textContent = this.stats.totalClosed || "0";
  }

  updateControlsState() {
    const isEnabled = this.settings.enabled;

    this.elements.expireTime.disabled = !isEnabled;
    this.elements.checkInterval.disabled = !isEnabled;
    this.elements.excludePinned.disabled = !isEnabled;

    this.elements.cleanupNow.disabled = !isEnabled;
  }

  async updateSetting(key, value) {
    try {
      this.settings[key] = value;

      const response = await this.sendMessage({
        action: "updateSettings",
        settings: { [key]: value },
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      this.updateControlsState();
      this.showMessage("Settings saved", "success");
    } catch (error) {
      console.error("Error updating setting:", error);
      this.showMessage("Failed to save settings", "error");
    }
  }

  async cleanupNow() {
    if (!this.settings.enabled) {
      this.showMessage("Extension is disabled", "error");
      return;
    }

    try {
      this.elements.cleanupNow.disabled = true;
      this.elements.cleanupNow.textContent = "Cleaning up...";
      this.elements.cleanupNow.classList.add("loading");

      const response = await this.sendMessage({ action: "cleanupNow" });

      if (response.success) {
        this.showMessage("Cleanup completed successfully", "success");
        // Refresh stats
        setTimeout(() => this.loadStats(), 1000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      this.showMessage("Cleanup failed", "error");
    } finally {
      this.elements.cleanupNow.disabled = false;
      this.elements.cleanupNow.textContent = "🧹 Clean up expired tabs now";
      this.elements.cleanupNow.classList.remove("loading");
    }
  }

  async resetStats() {
    if (
      !confirm(
        "Are you sure you want to reset all statistics? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await chrome.storage.local.set({
        closedToday: 0,
        totalClosed: 0,
        lastResetDate: new Date().toDateString(),
      });

      this.stats = {
        trackedTabs: this.stats.trackedTabs,
        closedToday: 0,
        totalClosed: 0,
      };

      this.updateStatsUI();
      this.showMessage("Statistics reset successfully", "success");
    } catch (error) {
      console.error("Error resetting stats:", error);
      this.showMessage("Failed to reset statistics", "error");
    }
  }

  async exportSettings() {
    try {
      const settingsData = {
        settings: this.settings,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expiring-tabs-settings-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showMessage("Settings exported successfully", "success");
    } catch (error) {
      console.error("Error exporting settings:", error);
      this.showMessage("Failed to export settings", "error");
    }
  }

  async importSettings(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.settings) {
        throw new Error("Invalid settings file format");
      }

      // Validate imported settings
      const validatedSettings = this.validateSettings(data.settings);

      const response = await this.sendMessage({
        action: "updateSettings",
        settings: validatedSettings,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      this.settings = { ...this.settings, ...validatedSettings };
      this.updateUI();
      this.showMessage("Settings imported successfully", "success");
    } catch (error) {
      console.error("Error importing settings:", error);
      this.showMessage("Failed to import settings: " + error.message, "error");
    }

    // Reset file input
    this.elements.importFile.value = "";
  }

  validateSettings(settings) {
    const validated = {};

    // Validate each setting
    if (typeof settings.enabled === "boolean") {
      validated.enabled = settings.enabled;
    }

    if (
      typeof settings.expireMinutes === "number" &&
      settings.expireMinutes > 0
    ) {
      validated.expireMinutes = settings.expireMinutes;
    }

    if (
      typeof settings.checkInterval === "number" &&
      settings.checkInterval > 0
    ) {
      validated.checkInterval = settings.checkInterval;
    }

    if (typeof settings.excludePinned === "boolean") {
      validated.excludePinned = settings.excludePinned;
    }

    return validated;
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

  showMessage(text, type = "info") {
    const statusMessage = this.elements.statusMessage;
    const statusText = statusMessage.querySelector(".status-text");

    statusText.textContent = text;
    statusMessage.className = `status-message ${type}`;

    // Show message
    statusMessage.classList.remove("hidden");

    // Hide after 4 seconds
    setTimeout(() => {
      statusMessage.classList.add("hidden");
    }, 4000);
  }
}

// Initialize options page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.optionsManager = new OptionsManager();
});

// Refresh stats periodically
setInterval(() => {
  if (window.optionsManager) {
    window.optionsManager.loadStats();
  }
}, 30000); // Every 30 seconds
