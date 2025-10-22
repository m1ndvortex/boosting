import React from 'react';
import './Sidebar.css';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  className?: string;
  width?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  className = '',
  width = 240,
  collapsible = false,
  collapsed = false,
  onToggleCollapse
}) => {
  const classes = [
    'discord-sidebar',
    collapsed && 'discord-sidebar--collapsed',
    className
  ].filter(Boolean).join(' ');

  return (
    <aside 
      className={classes} 
      style={{ width: collapsed ? 60 : width }}
    >
      {collapsible && (
        <div className="discord-sidebar__header">
          <button
            className="discord-sidebar__toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="discord-sidebar__toggle-icon">
              {collapsed ? '→' : '←'}
            </span>
          </button>
        </div>
      )}
      
      <nav className="discord-sidebar__nav">
        <ul className="discord-sidebar__list">
          {items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

interface SidebarItemComponentProps {
  item: SidebarItem;
  collapsed: boolean;
  level?: number;
}

const SidebarItemComponent: React.FC<SidebarItemComponentProps> = ({
  item,
  collapsed,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const itemClasses = [
    'discord-sidebar__item',
    item.active && 'discord-sidebar__item--active',
    hasChildren && 'discord-sidebar__item--has-children',
    level > 0 && 'discord-sidebar__item--nested'
  ].filter(Boolean).join(' ');

  const linkClasses = [
    'discord-sidebar__link',
    item.active && 'discord-sidebar__link--active'
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {item.icon && (
        <span className="discord-sidebar__icon">
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="discord-sidebar__label">{item.label}</span>
          {item.badge && (
            <span className="discord-sidebar__badge">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <span className={`discord-sidebar__arrow ${isExpanded ? 'discord-sidebar__arrow--expanded' : ''}`}>
              ▼
            </span>
          )}
        </>
      )}
    </>
  );

  return (
    <li className={itemClasses} style={{ paddingLeft: level * 16 }}>
      {item.href ? (
        <a href={item.href} className={linkClasses}>
          {content}
        </a>
      ) : (
        <button className={linkClasses} onClick={handleClick}>
          {content}
        </button>
      )}
      
      {hasChildren && isExpanded && !collapsed && (
        <ul className="discord-sidebar__submenu">
          {item.children!.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};