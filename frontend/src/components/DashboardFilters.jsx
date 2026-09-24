import React from 'react';
import {
  MagnifyingGlass,
  ArrowCounterClockwise,
  X,
  CaretDown,
  User,
  CheckCircle,
  Flag,
  Folder
} from '@phosphor-icons/react';

export function DashboardFilters({
  filters,
  responsibleOptions = [],
  categoryOptions = [],
  onChange,
  onReset
}) {
  const hasActiveFilters =
    (filters.search && filters.search.trim() !== '') ||
    filters.responsible !== 'all' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    (filters.category && filters.category !== 'all');

  const activeChips = [
    filters.search && { key: 'search', label: `Búsqueda: "${filters.search}"`, resetVal: '' },
    filters.responsible !== 'all' && { key: 'responsible', label: `Responsable: ${filters.responsible}`, resetVal: 'all' },
    filters.status !== 'all' && { key: 'status', label: `Estado: ${filters.status}`, resetVal: 'all' },
    filters.priority !== 'all' && { key: 'priority', label: `Prioridad: ${filters.priority}`, resetVal: 'all' },
    filters.category && filters.category !== 'all' && { key: 'category', label: `Categoría: ${filters.category}`, resetVal: 'all' }
  ].filter(Boolean);

  return (
    <div className="filters">
      {/* Fila superior: Buscador + Reinicio */}
      <div className="filters-top-row">
        <div className="search-wrapper">
          <MagnifyingGlass size={18} className="search-icon" weight="bold" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre de actividad, responsable, categoría..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
          />
          {filters.search && (
            <button
              className="search-clear"
              onClick={() => onChange('search', '')}
              aria-label="Limpiar búsqueda"
            >
              <X size={12} weight="bold" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button className="btn-reset" onClick={onReset}>
            <ArrowCounterClockwise size={14} weight="bold" />
            Reiniciar filtros
          </button>
        )}
      </div>

      {/* Selectores estándar */}
      <div className="filters-selects">
        <div className="filter-select-group">
          <label>
            <User size={13} weight="bold" />
            Responsable
          </label>
          <div className="select-wrapper">
            <select
              value={filters.responsible}
              onChange={(e) => onChange('responsible', e.target.value)}
            >
              <option value="all">Todos los responsables</option>
              {responsibleOptions.map((resp) => (
                <option key={resp} value={resp}>
                  {resp}
                </option>
              ))}
            </select>
            <CaretDown size={14} weight="bold" className="select-chevron" />
          </div>
        </div>

        <div className="filter-select-group">
          <label>
            <CheckCircle size={13} weight="bold" />
            Estado
          </label>
          <div className="select-wrapper">
            <select
              value={filters.status}
              onChange={(e) => onChange('status', e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="Culminada">Culminada</option>
              <option value="En curso">En curso</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Bloqueada">Bloqueada</option>
            </select>
            <CaretDown size={14} weight="bold" className="select-chevron" />
          </div>
        </div>

        <div className="filter-select-group">
          <label>
            <Flag size={13} weight="bold" />
            Prioridad
          </label>
          <div className="select-wrapper">
            <select
              value={filters.priority}
              onChange={(e) => onChange('priority', e.target.value)}
            >
              <option value="all">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
            <CaretDown size={14} weight="bold" className="select-chevron" />
          </div>
        </div>

        {categoryOptions.length > 0 && (
          <div className="filter-select-group">
            <label>
              <Folder size={13} weight="bold" />
              Categoría
            </label>
            <div className="select-wrapper">
              <select
                value={filters.category || 'all'}
                onChange={(e) => onChange('category', e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <CaretDown size={14} weight="bold" className="select-chevron" />
            </div>
          </div>
        )}
      </div>

      {/* Chips activos */}
      {activeChips.length > 0 && (
        <div className="active-chips">
          <span className="chips-label">Filtros activos:</span>
          {activeChips.map((chip) => (
            <span key={chip.key} className="filter-chip">
              {chip.label}
              <button
                type="button"
                onClick={() => onChange(chip.key, chip.resetVal)}
                aria-label={`Quitar filtro ${chip.key}`}
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
