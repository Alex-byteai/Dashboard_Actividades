import React from 'react';
import { ArrowsClockwise, CaretRight } from '@phosphor-icons/react';

export function TopBar({ onRefresh, isLoading, lastUpdate, activeView }) {
  const getBreadcrumb = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard Principal';
      case 'actividades': return 'Gestión de Actividades';
      case 'alertas': return 'Centro de Alertas';
      default: return 'IDIC';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return '';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Centro de Control</h1>
        <div className="topbar-breadcrumb">
          IDIC <CaretRight size={12} weight="bold" style={{ margin: '0 4px', verticalAlign: 'middle' }} /> {getBreadcrumb()}
        </div>
      </div>
      
      <div className="topbar-right">
        {lastUpdate && (
          <div style={{ textAlign: 'right', marginRight: '10px' }}>
            <div className="topbar-time">{formatTime(lastUpdate)}</div>
            <div className="topbar-date" style={{ textTransform: 'capitalize' }}>{formatDate(lastUpdate)}</div>
          </div>
        )}
        <button 
          className="topbar-refresh-btn"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <ArrowsClockwise 
            size={18} 
            weight="bold" 
            className={isLoading ? "animate-spin" : ""} 
          />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </header>
  );
}
