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

  const initializeTabGroups = useCallback(async () => {
    try {
      if (!chrome?.tabs) {
        throw new Error('Chrome APIs not available');
      }

      const savedTabGroups = await storage.getTabGroups();
      setUserTabGroups(savedTabGroups);

      const tabGroupObjects = savedTabGroups.map(convertLegacyGroupFormat);
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
  }, []);

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
    deleteGroup
  };
};