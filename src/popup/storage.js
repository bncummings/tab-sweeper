export const storage = {
  async getCustomGroups() {
    const result = await chrome.storage.local.get('customGroups');
    return result.customGroups || [];
  },

  async saveCustomGroups(groups) {
    await chrome.storage.local.set({ customGroups: groups });
  }
};