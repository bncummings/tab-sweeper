import React from 'react';

const TabItem = ({ tab, onClick }) => {
  const tabTitle = tab.title.split('|')[0].trim();
  const pathname = new URL(tab.url).pathname;

  return (
    <div className="tab-item" onClick={onClick}>
      <div className="tab-content">
        <h3 className="tab-title">{tabTitle}</h3>
        <p className="tab-pathname">{pathname}</p>
      </div>
      <div className="tab-favicon">
        {tab.favIconUrl && (
          <img 
            src={tab.favIconUrl} 
            alt="favicon" 
            className="favicon-img"
          />
        )}
      </div>
    </div>
  );
};

export default TabItem;
