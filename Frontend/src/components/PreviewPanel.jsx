import React from 'react';
import * as UIComponents from './ui';
import './PreviewPanel.css';

const renderComponent = (component, index) => {
  const Component = UIComponents[component.type];

  if (!Component) {
    return <div key={index}>Unknown component: {component.type}</div>;
  }

  const hasChildren =
    component.children &&
    component.children.length > 0;

  // If component has NO children → self-closing
  if (!hasChildren) {
    return <Component key={index} {...component.props} />;
  }

  // If component HAS children → wrap them
  return (
    <Component key={index} {...component.props}>
      {component.children.map((child, i) =>
        typeof child === 'object'
          ? renderComponent(child, i)
          : child
      )}
    </Component>
  );
};


const PreviewPanel = ({ plan, versionNumber }) => {
  if (!plan || !Array.isArray(plan.components)) {
    return (
      <div className="preview-placeholder">
        <h3>No UI to Preview</h3>
      </div>
    );
  }

  return (
    <div className="preview-panel-container">
      <div className="preview-header">
        <h3>Live Preview</h3>
        {versionNumber && (
          <span className="version-badge">v{versionNumber}</span>
        )}
      </div>

      <div className="preview-content">
        {plan.components.map((component, index) =>
          renderComponent(component, index)
        )}
      </div>
    </div>
  );
};


export default PreviewPanel;

