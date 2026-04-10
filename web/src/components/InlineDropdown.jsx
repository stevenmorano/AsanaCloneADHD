/**
 * InlineDropdown.jsx
 *
 * Reusable fixed-position dropdown used for:
 *   - Project picker (single-select with colored dots)
 *   - Section picker (single-select)
 *   - Tag picker     (multi-select + create new)
 *
 * Props:
 *   title          - string — header label
 *   options        - [{value, label, color?}]
 *   selected       - string — current single value
 *   selectedValues - string[] — current multi values
 *   onSelect       - fn(value, option) — single mode
 *   onMultiChange  - fn(newValues[]) — multi mode
 *   onCreate       - fn(label) — optional: show "+ Create" row
 *   position       - {x, y} — viewport coords of trigger bottom-left
 *   onClose        - fn()
 *   multiSelect    - boolean
 *   searchPlaceholder - string
 *   emptyText      - string — shown when no options match
 */

import { useEffect, useRef, useState } from 'react';
import './InlineDropdown.css';

export function InlineDropdown({
  title,
  options = [],
  selected,
  selectedValues,
  onSelect,
  onMultiChange,
  onCreate,
  position,
  onClose,
  multiSelect = false,
  searchPlaceholder = 'Search…',
  emptyText = 'No results',
}) {
  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const [query, setQuery] = useState('');

  // Auto-focus search
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  // Outside click + Escape
  useEffect(() => {
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    }
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown',   onKey);
    };
  }, [onClose]);

  // Viewport-aware positioning
  const style = (() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const w = 224;
    const estimatedH = Math.min(options.length * 34 + 100, 300);
    let x = position.x;
    let y = position.y;
    if (x + w > W - 8) x = W - w - 8;
    if (y + estimatedH > H - 8) y = position.y - estimatedH - 4;
    return { left: Math.max(4, x), top: Math.max(4, y) };
  })();

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const trimmedQuery = query.trim();
  const canCreate =
    !!onCreate &&
    trimmedQuery.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());

  function handleSelect(option) {
    if (multiSelect) {
      const vals = selectedValues || [];
      const next = vals.includes(option.value)
        ? vals.filter((v) => v !== option.value)
        : [...vals, option.value];
      onMultiChange?.(next);
    } else {
      onSelect?.(option.value, option);
      onClose();
    }
  }

  function handleCreate() {
    if (!canCreate) return;
    onCreate(trimmedQuery);
    if (!multiSelect) onClose();
    setQuery('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && (canCreate || filtered.length === 1)) {
      e.preventDefault();
      if (filtered.length === 1 && !canCreate) {
        handleSelect(filtered[0]);
      } else {
        handleCreate();
      }
    }
    e.stopPropagation();
  }

  return (
    <div
      ref={containerRef}
      className="idrop"
      style={style}
      role="dialog"
      aria-label={title || 'Select'}
    >
      {title && <div className="idrop__title">{title}</div>}

      <div className="idrop__search-row">
        <input
          ref={inputRef}
          className="idrop__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={searchPlaceholder}
          aria-label="Search"
        />
      </div>

      <div className="idrop__list" role="listbox">
        {filtered.map((option) => {
          const isSel = multiSelect
            ? (selectedValues || []).includes(option.value)
            : selected === option.value;

          return (
            <button
              key={option.value}
              className={`idrop__option ${isSel ? 'idrop__option--active' : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={isSel}
            >
              {option.color && (
                <span
                  className="idrop__dot"
                  style={{ background: option.color }}
                  aria-hidden="true"
                />
              )}
              <span className="idrop__label">{option.label}</span>
              {multiSelect ? (
                <span className={`idrop__checkbox ${isSel ? 'idrop__checkbox--on' : ''}`}
                  aria-hidden="true">
                  {isSel ? '✓' : ''}
                </span>
              ) : (
                isSel && <span className="idrop__checkmark" aria-hidden="true">✓</span>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && !canCreate && (
          <div className="idrop__empty">{emptyText}</div>
        )}

        {canCreate && (
          <button className="idrop__create" onClick={handleCreate}>
            <span className="idrop__create-plus">+</span>
            Create "<strong>{trimmedQuery}</strong>"
          </button>
        )}
      </div>
    </div>
  );
}
