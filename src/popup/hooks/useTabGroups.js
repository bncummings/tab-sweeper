import { useState, useEffect, useCallback } from 'react';
import { storage } from '../storage.js';
import { findMatchingTabs } from '../matcher-utils.js';
import { sortTabsByTitle, removeDuplicateTabs, isValidUrl } from '../utils.js';
import tabsModule from '../tabs.js';

const { createGroup } = tabsModule;

const convertLegacyGroupFormat = (tabGroup) => {
  const group = createGroup(tabGroup.name);
  
  if (tabGroup.matchers) {
    group.matchers = tabGroup.matchers;
  } else if (tabGroup.matchType === 'regex') {
    group.matchers = tabGroup.regexPatterns.map(pattern => ({ 
      value: pattern, 
      type: 'regex' 
    }));
  } else {
    const prefixes = tabGroup.urlPrefixes || [tabGroup.urlPrefix];
    group.matchers = prefixes.map(prefix => ({ 
      value: prefix, 
      type: 'prefix' 
    }));
  }
  
  return group;
};

export const useTabGroups = () => {
  const [tabGroups, setTabGroups] = useState({});
  const [userTabGroups, setUserTabGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const detectManualTabGroups = useCallback(async () => {
    try {
      if (!chrome?.tabGroups || !chrome?.tabs) {
        return [];
      }

      const windows = await chrome.windows.getAll({ populate: true });
      const manualGroups = [];

      for (const win of windows) {
        if (!chrome.tabGroups.query) continue;
        const groups = await chrome.tabGroups.query({ windowId: win.id });
        
        for (const group of groups) {
          if (group.title) { // Only consider groups with titles
            const tabsInGroup = await chrome.tabs.query({ windowId: win.id, groupId: group.id });
            
            if (tabsInGroup.length > 0) {
              // Create matchers for each unique URL in the group
              const urls = [...new Set(tabsInGroup.map(tab => tab.url).filter(url => isValidUrl(url)))];
              const matchers = urls.map(url => ({ value: url, type: 'prefix' }));
              
              if (matchers.length > 0) {
                manualGroups.push({
                  name: group.title,
                  matchers: matchers,
                  isManual: true // Flag to indicate this was detected from Chrome
                });
              }
            }
          }
        }
      }

      return manualGroups;
    } catch (error) {
      console.error('Error detecting manual tab groups:', error);
      return [];
    }
  }, []);

  const syncWithChromeTabGroups = useCallback(async () => {
    try {
      if (!chrome?.tabGroups || !chrome?.tabs) {
        return;
      }

      const savedTabGroups = await storage.getTabGroups();
      const windows = await chrome.windows.getAll({ populate: true });
      const existingChromeGroupNames = new Set();
      
      for (const win of windows) {
        if (!chrome.tabGroups.query) continue;
        const groups = await chrome.tabGroups.query({ windowId: win.id });
        groups.forEach(group => {
          if (group.title) {
            existingChromeGroupNames.add(group.title);
          }
        });
      }

      const syncedTabGroups = savedTabGroups.filter(group => {
        if (!group.isManual) {
          return true;
        }

        return existingChromeGroupNames.has(group.name);
      });

      if (syncedTabGroups.length !== savedTabGroups.length) {
        await storage.saveTabGroups(syncedTabGroups);
        setUserTabGroups(syncedTabGroups);
        
        const tabGroupObjects = syncedTabGroups.map(convertLegacyGroupFormat);
        const groups = {};
        
        for (const group of tabGroupObjects) {
          const matchingTabs = await findMatchingTabs(group.matchers);
          const uniqueTabs = removeDuplicateTabs(matchingTabs);
          groups[group.name] = sortTabsByTitle(uniqueTabs);
        }
        
        setTabGroups(groups);
      }
    } catch (error) {
      console.error('Error syncing with Chrome tab groups:', error);
    }
  }, []);

  const initializeTabGroups = useCallback(async () => {
    try {
      if (!chrome?.tabs) {
        throw new Error('Chrome APIs not available');
      }

      await syncWithChromeTabGroups();

      const savedTabGroups = await storage.getTabGroups();
      const manualTabGroups = await detectManualTabGroups();
      
      // Merge saved groups with detected manual groups, avoiding duplicates
      const savedGroupNames = new Set(savedTabGroups.map(g => g.name));
      const newManualGroups = manualTabGroups.filter(g => !savedGroupNames.has(g.name));
      
      const allTabGroups = [...savedTabGroups, ...newManualGroups];
      
      // Save the updated list including new manual groups
      if (newManualGroups.length > 0) {
        await storage.saveTabGroups(allTabGroups);
      }
      
      setUserTabGroups(allTabGroups);

      const tabGroupObjects = allTabGroups.map(convertLegacyGroupFormat);
      const groups = {};
      
      for (const group of tabGroupObjects) {
        const matchingTabs = await findMatchingTabs(group.matchers);
        const uniqueTabs = removeDuplicateTabs(matchingTabs);
        groups[group.name] = sortTabsByTitle(uniqueTabs);
      }

      setTabGroups(groups);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing tab groups:', error);
      setError(error.message);
      setIsLoading(false);
      setTabGroups({});
    }
  }, [detectManualTabGroups, syncWithChromeTabGroups]);

  const createTabGroup = useCallback(async (groupName, matchers) => {
    const validMatchers = matchers
      .filter(m => m.type !== 'prefix' || isValidUrl(m.value.trim()))
      .map(m => ({ value: m.value.trim(), type: m.type }));
    
    if (validMatchers.length === 0) {
      console.warn(`No valid matchers found for group "${groupName}"`);
      return;
    }
    
    const newTabGroup = { name: groupName, matchers: validMatchers };
    const updatedTabGroups = [...userTabGroups, newTabGroup];
    
    await storage.saveTabGroups(updatedTabGroups);
    setUserTabGroups(updatedTabGroups);
    
    const matchingTabs = await findMatchingTabs(validMatchers);
    const uniqueTabs = removeDuplicateTabs(matchingTabs);
    const sortedTabs = sortTabsByTitle(uniqueTabs);
    
    setTabGroups(prev => ({ ...prev, [groupName]: sortedTabs }));
  }, [userTabGroups]);

  const updateGroup = useCallback(async (originalName, newName, matchers) => {
    const validMatchers = matchers
      .filter(m => m.type !== 'prefix' || isValidUrl(m.value.trim()))
      .map(m => ({ value: m.value.trim(), type: m.type }));
    
    if (validMatchers.length === 0) {
      console.warn(`No valid matchers found for group "${newName}"`);
      return;
    }
    
    const updatedTabGroups = userTabGroups.map(group => 
      group.name === originalName 
        ? { name: newName, matchers: validMatchers }
        : group
    );
    
    await storage.saveTabGroups(updatedTabGroups);
    setUserTabGroups(updatedTabGroups);
    
    const newTabGroups = { ...tabGroups };
    if (originalName !== newName) {
      delete newTabGroups[originalName];
    }
    
    const matchingTabs = await findMatchingTabs(validMatchers);
    const uniqueTabs = removeDuplicateTabs(matchingTabs);
    const sortedTabs = sortTabsByTitle(uniqueTabs);
    
    setTabGroups({ ...newTabGroups, [newName]: sortedTabs });
  }, [userTabGroups, tabGroups]);

  const deleteGroup = useCallback(async (groupName) => {
    if (chrome?.tabGroups && chrome?.tabs) {
      try {
        const windows = await chrome.windows.getAll({ populate: true });

        for (const win of windows) {
          if (chrome.tabGroups.query) {
            const groups = await chrome.tabGroups.query({ title: groupName, windowId: win.id });

            for (const group of groups) {
              const tabsInGroup = await chrome.tabs.query({ windowId: win.id, groupId: group.id });
              const tabIds = tabsInGroup.map(tab => tab.id);

              if (tabIds.length > 0) {
                await chrome.tabs.ungroup(tabIds);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not ungroup Chrome tab group:', err);
      }
    }

    const updatedTabGroups = userTabGroups.filter(g => g.name !== groupName);
    await storage.saveTabGroups(updatedTabGroups);

    setUserTabGroups(updatedTabGroups);
    const newTabGroups = { ...tabGroups };

    delete newTabGroups[groupName];
    setTabGroups(newTabGroups);
  }, [userTabGroups, tabGroups]);

  useEffect(() => {
    initializeTabGroups();
  }, [initializeTabGroups]);

  return {
    tabGroups,
    userTabGroups,
    isLoading,
    error,
    createTabGroup,
    updateGroup,
    deleteGroup,
    syncWithChromeTabGroups
  };
};