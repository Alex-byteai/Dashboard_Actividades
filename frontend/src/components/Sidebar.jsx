import React from 'react';
import {
  SquaresFour,
  ListChecks,
  WarningCircle,
  GearSix,
  CloudCheck,
  HardDrive
} from '@phosphor-icons/react';

export function Sidebar({ activeView, onChangeView, dataSource, alertCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
    { id: 'actividades', label: 'Actividades', icon: ListChecks },
    { id: 'alertas', label: 'Alertas', icon: WarningCircle, badge: alertCount },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">ID</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">IDIC</span>
          <span className="sidebar-brand-sub">Universidad de Lima</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onChangeView(item.id)}
            >
              <Icon size={20} weight={activeView === item.id ? 'fill' : 'bold'} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-data-source">
          <span className={`sidebar-data-dot ${dataSource === 'sheets' ? 'live' : 'local'}`} />
          <span>
            {dataSource === 'sheets' ? 'Google Sheets (vivo)' : 'Datos locales'}
          </span>
        </div>
      </div>
    </aside>
  );
}
