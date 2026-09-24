import React from 'react';
import {
  ListChecks,
  CheckCircle,
  ClockCountdown,
  WarningCircle,
  ChartLineUp
} from '@phosphor-icons/react';
import { formatCount } from '../utils/activityMetrics';

export function KpiGrid({ metrics }) {
  const cards = [
    {
      key: 'total',
      label: 'Total Actividades',
      value: formatCount(metrics.total),
      icon: ListChecks,
      isAlert: false
    },
    {
      key: 'completed',
      label: 'Culminadas',
      value: formatCount(metrics.completed),
      icon: CheckCircle,
      isAlert: false
    },
    {
      key: 'active',
      label: 'En Seguimiento',
      value: formatCount(metrics.active),
      icon: ClockCountdown,
      isAlert: false
    },
    {
      key: 'alerts',
      label: 'Alertas de Gestión',
      value: formatCount(metrics.alerts),
      icon: WarningCircle,
      isAlert: metrics.alerts > 0
    },
    {
      key: 'averageFlow',
      label: 'Avance Ponderado',
      value: `${metrics.averageFlow}%`,
      icon: ChartLineUp,
      isAlert: false
    }
  ];

  return (
    <div className="stats-bar" aria-label="Indicadores clave de gestión">
      <div className="stats-container">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`stat-card ${card.isAlert ? 'stat-card--alert' : ''}`}
            >
              <div className="stat-icon">
                <Icon size={26} weight="bold" />
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
