import React from 'react';

export function InstitutionalFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-brand">
          Instituto de Investigación Científica (IDIC) · Universidad de Lima
        </p>
        <p className="footer-legal">
          Herramienta institucional de seguimiento de proyectos y actividades de investigación.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
          Fuente de datos consolidada: <code>Registro_y_Seguimiento_Actividades.xlsx</code> · Periodo 2026
        </p>
      </div>
    </footer>
  );
}
