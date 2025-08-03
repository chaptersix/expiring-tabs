// Background service worker for Expiring Tabs extension
class TabManager {
  constructor() {
    this.ALARM_NAME = "expiring-tabs-cleanup";
    this.DEFAULT_EXPIRE_MINUTES = 30;
    this.DEFAULT_CHECK_INTERVAL = 5; // Check every 5 minutes

    console.log("[ExpiringTabs] TabManager initialized");
    this.init();
  }

  async init() {
    console.log("[ExpiringTabs] Setting up event listeners...");

    // Set up event listeners
    chrome.tabs.onCreated.addListener((tab) => this.trackTab(tab));
    chrome.tabs.onActivated.addListener((activeInfo) =>
      this.updateTabActivity(activeInfo.tabId),
    );
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete") {
        this.updateTabActivity(tabId);
      }
    });
    chrome.tabs.onRemoved.addListener((tabId) => this.untrackTab(tabId));
    chrome.alarms.onAlarm.addListener((alarm) => this.handleAlarm(alarm));

    console.log("[ExpiringTabs] Event listeners set up");

    // Initialize existing tabs on startup
    await this.initializeExistingTabs();

    // Set up periodic cleanup alarm
    await this.setupAlarm();

    console.log("[ExpiringTabs] Initialization complete");
  }

  async initializeExistingTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      const now = Date.now();

      console.log(`[ExpiringTabs] Initializing ${tabs.length} existing tabs`);

      for (const tab of tabs) {
        await this.trackTab(tab, now);
      }

      console.log(
        `[ExpiringTabs] Successfully initialized ${tabs.length} tabs`,
      );
    } catch (error) {
      console.error("[ExpiringTabs] Error initializing existing tabs:", error);
    }
  }

  async trackTab(tab, timestamp = Date.now()) {
    if (!tab.id) return;

    try {
      const tabData = {
        id: tab.id,
        createdAt: timestamp,
        lastActiveAt: timestamp,
        pinned: tab.pinned || false,
      };

      await chrome.storage.local.set({
        [`tab_${tab.id}`]: tabData,
      });

      console.log(
        `[ExpiringTabs] Tracking tab ${tab.id} (pinned: ${tabData.pinned})`,
      );
    } catch (error) {
      console.error("[ExpiringTabs] Error tracking tab:", error);
    }
  }

  async updateTabActivity(tabId) {
    if (!tabId) return;

    try {
      const key = `tab_${tabId}`;
      const result = await chrome.storage.local.get(key);

      if (result[key]) {
        result[key].lastActiveAt = Date.now();
        await chrome.storage.local.set({ [key]: result[key] });
        console.log(`[ExpiringTabs] Updated activity for tab ${tabId}`);
      }
    } catch (error) {
      console.error("[ExpiringTabs] Error updating tab activity:", error);
    }
  }

  async untrackTab(tabId) {
    try {
      await chrome.storage.local.remove(`tab_${tabId}`);
      console.log(`[ExpiringTabs] Untracked tab ${tabId}`);
    } catch (error) {
      console.error("[ExpiringTabs] Error untracking tab:", error);
    }
  }

  async setupAlarm() {
    try {
      // Clear existing alarm
      await chrome.alarms.clear(this.ALARM_NAME);

      // Get check interval from settings
      const settings = await this.getSettings();
      const intervalMinutes =
        settings.checkInterval || this.DEFAULT_CHECK_INTERVAL;

      // Create new alarm
      await chrome.alarms.create(this.ALARM_NAME, {
        delayInMinutes: intervalMinutes,
        periodInMinutes: intervalMinutes,
      });

      console.log(
        `[ExpiringTabs] Alarm set up with ${intervalMinutes} minute interval`,
      );
    } catch (error) {
      console.error("[ExpiringTabs] Error setting up alarm:", error);
    }
  }

  async handleAlarm(alarm) {
    if (alarm.name === this.ALARM_NAME) {
      console.log("[ExpiringTabs] Alarm triggered - starting cleanup");
      await this.cleanupExpiredTabs();
    }
  }

  async cleanupExpiredTabs() {
    try {
      const settings = await this.getSettings();
      const expireMinutes =
        settings.expireMinutes || this.DEFAULT_EXPIRE_MINUTES;
      const excludePinned = settings.excludePinned !== false; // Default to true

      console.log(
        `[ExpiringTabs] Starting cleanup - expire after ${expireMinutes} minutes, exclude pinned: ${excludePinned}`,
      );

      const now = Date.now();
      const expireThreshold = now - expireMinutes * 60 * 1000;

      // Get all tracked tabs
      const storage = await chrome.storage.local.get();
      const tabsToClose = [];
      let trackedTabsCount = 0;
      let pinnedTabsSkipped = 0;

      for (const [key, tabData] of Object.entries(storage)) {
        if (!key.startsWith("tab_")) continue;

        trackedTabsCount++;

        // Skip if tab is pinned and we're excluding pinned tabs
        if (excludePinned && tabData.pinned) {
          pinnedTabsSkipped++;
          continue;
        }

        // Check if tab has expired
        const inactiveTime = now - tabData.lastActiveAt;
        const inactiveMinutes = Math.floor(inactiveTime / (60 * 1000));

        if (tabData.lastActiveAt < expireThreshold) {
          console.log(
            `[ExpiringTabs] Tab ${tabData.id} expired (inactive for ${inactiveMinutes} minutes)`,
          );
          tabsToClose.push(tabData.id);
        }
      }

      console.log(
        `[ExpiringTabs] Found ${trackedTabsCount} tracked tabs, ${pinnedTabsSkipped} pinned tabs skipped, ${tabsToClose.length} tabs to close`,
      );

      // Close expired tabs
      for (const tabId of tabsToClose) {
        try {
          await chrome.tabs.remove(tabId);
          await this.untrackTab(tabId);
          console.log(`[ExpiringTabs] Successfully closed tab ${tabId}`);
        } catch (error) {
          // Tab might already be closed, just untrack it
          console.log(`[ExpiringTabs] Tab ${tabId} already closed, untracking`);
          await this.untrackTab(tabId);
        }
      }

      if (tabsToClose.length > 0) {
        console.log(
          `[ExpiringTabs] Cleanup complete: closed ${tabsToClose.length} expired tabs`,
        );
      } else {
        console.log(`[ExpiringTabs] Cleanup complete: no tabs needed closing`);
      }
    } catch (error) {
      console.error("[ExpiringTabs] Error cleaning up expired tabs:", error);
    }
  }

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get({
        expireMinutes: this.DEFAULT_EXPIRE_MINUTES,
        checkInterval: this.DEFAULT_CHECK_INTERVAL,
        excludePinned: true,
        enabled: true,
      });
      console.log(`[ExpiringTabs] Current settings:`, result);
      return result;
    } catch (error) {
      console.error("[ExpiringTabs] Error getting settings:", error);
      return {
        expireMinutes: this.DEFAULT_EXPIRE_MINUTES,
        checkInterval: this.DEFAULT_CHECK_INTERVAL,
        excludePinned: true,
        enabled: true,
      };
    }
  }

  async updateSettings(newSettings) {
    try {
      console.log(`[ExpiringTabs] Updating settings:`, newSettings);
      await chrome.storage.sync.set(newSettings);
      // Restart alarm with new interval if it changed
      if (newSettings.checkInterval) {
        await this.setupAlarm();
      }
    } catch (error) {
      console.error("[ExpiringTabs] Error updating settings:", error);
    }
  }
}

// Initialize the tab manager
console.log("[ExpiringTabs] Service worker starting...");
const tabManager = new TabManager();

// Handle messages from popup/options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`[ExpiringTabs] Received message:`, request);

  if (request.action === "getSettings") {
    tabManager.getSettings().then(sendResponse);
    return true; // Keep message channel open for async response
  } else if (request.action === "updateSettings") {
    tabManager
      .updateSettings(request.settings)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error(`[ExpiringTabs] Failed to update settings:`, error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "getTabStats") {
    chrome.storage.local.get().then((storage) => {
      const tabCount = Object.keys(storage).filter((key) =>
        key.startsWith("tab_"),
      ).length;
      console.log(`[ExpiringTabs] Current tab count: ${tabCount}`);
      sendResponse({ tabCount });
    });
    return true;
  } else if (request.action === "cleanupNow") {
    console.log(`[ExpiringTabs] Manual cleanup requested`);
    tabManager
      .cleanupExpiredTabs()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error(`[ExpiringTabs] Manual cleanup failed:`, error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Keepalive for debugging - prevents service worker from going inactive
let keepAliveInterval;
globalThis.keepAlive = {
  start() {
    if (keepAliveInterval) return;
    console.log(
      "[ExpiringTabs] 🔥 Keepalive started - service worker will stay active",
    );
    keepAliveInterval = setInterval(() => {
      console.log("[ExpiringTabs] 💓 Keepalive ping");
    }, 20000); // Every 20 seconds
  },

  stop() {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
      console.log(
        "[ExpiringTabs] 💤 Keepalive stopped - service worker may go inactive",
      );
    }
  },
};

// Add debugging helper functions to global scope for console access
globalThis.debugHelpers = {
  // Get all tracked tab data
  async getAllTrackedTabs() {
    const storage = await chrome.storage.local.get();
    const tabData = {};
    for (const [key, value] of Object.entries(storage)) {
      if (key.startsWith("tab_")) {
        tabData[key] = value;
      }
    }
    console.table(tabData);
    return tabData;
  },

  // Get current Chrome tabs
  async getCurrentTabs() {
    const tabs = await chrome.tabs.query({});
    const simplifiedTabs = tabs.map((tab) => ({
      id: tab.id,
      title: tab.title?.substring(0, 50) + "...",
      pinned: tab.pinned,
      active: tab.active,
      windowId: tab.windowId,
    }));
    console.table(simplifiedTabs);
    return tabs;
  },

  // Compare tracked vs actual tabs
  async compareTrackedVsActual() {
    const [tabs, storage] = await Promise.all([
      chrome.tabs.query({}),
      chrome.storage.local.get(),
    ]);

    const actualTabs = new Set(tabs.map((t) => t.id));
    const trackedTabs = new Set();

    for (const key of Object.keys(storage)) {
      if (key.startsWith("tab_")) {
        trackedTabs.add(parseInt(key.replace("tab_", "")));
      }
    }

    const orphaned = Array.from(trackedTabs).filter(
      (id) => !actualTabs.has(id),
    );
    const untracked = Array.from(actualTabs).filter(
      (id) => !trackedTabs.has(id),
    );

    console.log("📊 Tab Comparison Report:");
    console.log("Actual tabs:", Array.from(actualTabs));
    console.log("Tracked tabs:", Array.from(trackedTabs));
    console.log("🧟 Orphaned (tracked but not open):", orphaned);
    console.log("👻 Untracked (open but not tracked):", untracked);

    return {
      actualTabs: Array.from(actualTabs),
      trackedTabs: Array.from(trackedTabs),
      orphaned,
      untracked,
    };
  },

  // Check tab ages and activity
  async getTabAges() {
    const storage = await chrome.storage.local.get();
    const now = Date.now();
    const tabAges = [];

    for (const [key, tabData] of Object.entries(storage)) {
      if (key.startsWith("tab_")) {
        const inactiveTime = now - tabData.lastActiveAt;
        const inactiveMinutes = Math.floor(inactiveTime / (60 * 1000));

        tabAges.push({
          tabId: tabData.id,
          pinned: tabData.pinned,
          inactiveMinutes: inactiveMinutes,
          createdAt: new Date(tabData.createdAt).toLocaleString(),
          lastActiveAt: new Date(tabData.lastActiveAt).toLocaleString(),
        });
      }
    }

    tabAges.sort((a, b) => b.inactiveMinutes - a.inactiveMinutes);
    console.table(tabAges);
    return tabAges;
  },

  // Dry run cleanup simulation
  async dryRunCleanup() {
    const settings = await tabManager.getSettings();
    const expireMinutes = settings.expireMinutes || 30;
    const excludePinned = settings.excludePinned !== false;

    console.log(
      `🧪 Dry run cleanup - expire after ${expireMinutes} minutes, exclude pinned: ${excludePinned}`,
    );

    const now = Date.now();
    const expireThreshold = now - expireMinutes * 60 * 1000;

    const storage = await chrome.storage.local.get();
    const tabsToClose = [];
    const results = [];

    for (const [key, tabData] of Object.entries(storage)) {
      if (!key.startsWith("tab_")) continue;

      const inactiveTime = now - tabData.lastActiveAt;
      const inactiveMinutes = Math.floor(inactiveTime / (60 * 1000));

      const result = {
        tabId: tabData.id,
        pinned: tabData.pinned,
        inactiveMinutes: inactiveMinutes,
        wouldBeClosed: false,
        reason: "",
      };

      if (excludePinned && tabData.pinned) {
        result.reason = "📌 Pinned tab (excluded)";
      } else if (tabData.lastActiveAt >= expireThreshold) {
        result.reason = `⏰ Still active (${inactiveMinutes} < ${expireMinutes} minutes)`;
      } else {
        result.wouldBeClosed = true;
        result.reason = `💀 Expired (${inactiveMinutes} >= ${expireMinutes} minutes)`;
        tabsToClose.push(tabData.id);
      }

      results.push(result);
    }

    console.table(results);
    console.log(`\n🎯 Would close ${tabsToClose.length} tabs:`, tabsToClose);
    return { results, tabsToClose };
  },

  // Get current settings
  async getSettings() {
    const settings = await tabManager.getSettings();
    console.log("⚙️ Current settings:", settings);
    return settings;
  },

  // Clean up orphaned tab data
  async cleanupOrphaned() {
    const comparison = await this.compareTrackedVsActual();
    if (comparison.orphaned.length === 0) {
      console.log("✅ No orphaned tab data found");
      return;
    }

    console.log(
      `🧹 Cleaning up ${comparison.orphaned.length} orphaned tab entries...`,
    );
    for (const tabId of comparison.orphaned) {
      await chrome.storage.local.remove(`tab_${tabId}`);
      console.log(`🗑️ Removed orphaned data for tab ${tabId}`);
    }
    console.log("✅ Orphaned cleanup complete");
  },

  // Force cleanup now
  async forceCleanup() {
    console.log("🚀 Forcing immediate cleanup...");
    await tabManager.cleanupExpiredTabs();
    console.log("✅ Force cleanup complete");
  },
};

// Make helpers easily accessible
console.log("🛠️ Debug helpers loaded! Try:");
console.log("- debugHelpers.getAllTrackedTabs()");
console.log("- debugHelpers.getCurrentTabs()");
console.log("- debugHelpers.compareTrackedVsActual()");
console.log("- debugHelpers.getTabAges()");
console.log("- debugHelpers.dryRunCleanup()");
console.log("- debugHelpers.getSettings()");
console.log("- debugHelpers.cleanupOrphaned()");
console.log("- debugHelpers.forceCleanup()");
console.log("");
console.log("🔥 Keepalive helpers:");
console.log("- keepAlive.start()  // Keep service worker active");
console.log("- keepAlive.stop()   // Allow service worker to sleep");
