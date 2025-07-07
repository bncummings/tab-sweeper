import React from 'react';
import TabItem from './TabItem';

const TabGroup = ({ title, tabs, onTabClick }) => {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="tab-group">
      <h2 className="group-title">{title}</h2>
      <div className="tab-list">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            onClick={() => onTabClick(tab)}
          />
        ))}
      </div>
    </div>
  );
};

export default TabGroup;
