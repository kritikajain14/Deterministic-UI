
import React from 'react';
import './styles.css';

const Sidebar = ({
  collapsed = false,
  items = [],
  children,
  ...props
}) => {
  const className = `ui-sidebar ${collapsed ? 'ui-sidebar-collapsed' : ''}`;
  
  return (
    <aside className={className} {...props}>
      <div className="ui-sidebar-content">
        {items.map((item, index) => (
          <div key={index} className="ui-sidebar-item">
            {item.icon && <span className="ui-sidebar-item-icon">{item.icon}</span>}
            {!collapsed && (
              <>
                <span className="ui-sidebar-item-label">{item.label}</span>
                {item.badge && (
                  <span className="ui-sidebar-item-badge">{item.badge}</span>
                )}
              </>
            )}
          </div>
        ))}
        {children}
      </div>
    </aside>
  );
};

export default Sidebar;