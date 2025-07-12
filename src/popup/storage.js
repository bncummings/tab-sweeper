export const storage = {
  async getTabGroups() {
    // Support legacy customGroups key for backward compatibility
    const result = await chrome.storage.local.get(['tabGroups', 'customGroups']);
    return result.tabGroups || result.customGroups || [];
  },

  async saveTabGroups(groups) {
    await chrome.storage.local.set({ tabGroups: groups });
    // Remove legacy customGroups key if it exists
    await chrome.storage.local.remove('customGroups');
  }
};