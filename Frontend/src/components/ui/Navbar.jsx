import React from 'react';
import './styles.css';

const Navbar = ({
  title,
  logo,
  items = [],
  children,
  ...props
}) => {
  return (
    <nav className="ui-navbar" {...props}>
      <div className="ui-navbar-brand">
        {logo && <img src={logo} alt={title} className="ui-navbar-logo" />}
        <span className="ui-navbar-title">{title}</span>
      </div>
      <div className="ui-navbar-items">
        {items.map((item, index) => (
          <a key={index} href={item.href} className="ui-navbar-item">
            {item.label}
          </a>
        ))}
        {children}
      </div>
    </nav>
  );
};

export default Navbar;