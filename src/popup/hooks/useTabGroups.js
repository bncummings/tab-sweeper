import { useState, useEffect, useCallback } from 'react';
import { storage } from '../storage.js';
import { findMatchingTabs } from '../matcher-utils.js';
import { sortTabsByTitle, removeDuplicateTabs, isValidUrl } from '../utils.js';
import tabsModule from '../tabs.js';

const { createGroup } = tabsModule;

const convertLegacyGroupFormat = (customGroup) => {
  const group = createGroup(customGroup.name);
  
  if (customGroup.matchers) {
    group.matchers = customGroup.matchers;
  } else if (customGroup.matchType === 'regex') {
    group.matchers = customGroup.regexPatterns.map(pattern => ({ 
      value: pattern, 
      type: 'regex' 
    }));
  } else {
    const prefixes = customGroup.urlPrefixes || [customGroup.urlPrefix];
    group.matchers = prefixes.map(prefix => ({ 
      value: prefix, 
      type: 'prefix' 
    }));
  }
  
  return group;
};

export const useTabGroups = () => {
  const [tabGroups, setTabGroups] = useState({});
  const [customGroups, setCustomGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeTabGroups = useCallback(async () => {
    try {
      if (!chrome?.tabs) {
        throw new Error('Chrome APIs not available');
      }

      const savedCustomGroups = await storage.getCustomGroups();
      setCustomGroups(savedCustomGroups);

      const customGroupObjects = savedCustomGroups.map(convertLegacyGroupFormat);
      const groups = {};
      
      for (const group of customGroupObjects) {
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
      setTabGroups({ 'Google': [], 'JavaScript': [] });
    }
  }, []);

  const createCustomGroup = useCallback(async (groupName, matchers) => {
    const validMatchers = matchers
      .filter(m => m.type !== 'prefix' || isValidUrl(m.value.trim()))
      .map(m => ({ value: m.value.trim(), type: m.type }));
    
    if (validMatchers.length === 0) {
      console.warn(`No valid matchers found for group "${groupName}"`);
      return;
    }
    
    const newCustomGroup = { name: groupName, matchers: validMatchers };
    const updatedCustomGroups = [...customGroups, newCustomGroup];
    
    await storage.saveCustomGroups(updatedCustomGroups);
    setCustomGroups(updatedCustomGroups);
    
    const matchingTabs = await findMatchingTabs(validMatchers);
    const uniqueTabs = removeDuplicateTabs(matchingTabs);
    const sortedTabs = sortTabsByTitle(uniqueTabs);
    
    setTabGroups(prev => ({ ...prev, [groupName]: sortedTabs }));
  }, [customGroups]);

  const updateGroup = useCallback(async (originalName, newName, matchers) => {
    const validMatchers = matchers
      .filter(m => m.type !== 'prefix' || isValidUrl(m.value.trim()))
      .map(m => ({ value: m.value.trim(), type: m.type }));
    
    if (validMatchers.length === 0) {
      console.warn(`No valid matchers found for group "${newName}"`);
      return;
    }
    
    const updatedCustomGroups = customGroups.map(group => 
      group.name === originalName 
        ? { name: newName, matchers: validMatchers }
        : group
    );
    
    await storage.saveCustomGroups(updatedCustomGroups);
    setCustomGroups(updatedCustomGroups);
    
    const newTabGroups = { ...tabGroups };
    if (originalName !== newName) {
      delete newTabGroups[originalName];
    }
    
    const matchingTabs = await findMatchingTabs(validMatchers);
    const uniqueTabs = removeDuplicateTabs(matchingTabs);
    const sortedTabs = sortTabsByTitle(uniqueTabs);
    
    setTabGroups({ ...newTabGroups, [newName]: sortedTabs });
  }, [customGroups, tabGroups]);

  const deleteGroup = useCallback(async (groupName) => {
    const updatedCustomGroups = customGroups.filter(g => g.name !== groupName);
    
    await storage.saveCustomGroups(updatedCustomGroups);
    setCustomGroups(updatedCustomGroups);
    
    const newTabGroups = { ...tabGroups };
    delete newTabGroups[groupName];
    setTabGroups(newTabGroups);
  }, [customGroups, tabGroups]);

  const isCustomGroup = useCallback((groupName) => 
    customGroups.some(g => g.name === groupName), [customGroups]);

  useEffect(() => {
    initializeTabGroups();
  }, [initializeTabGroups]);

  return {
    tabGroups,
    customGroups,
    isLoading,
    error,
    createCustomGroup,
    updateGroup,
    deleteGroup,
    isCustomGroup
  };
};