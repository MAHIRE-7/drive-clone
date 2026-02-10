import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaCalendar } from 'react-icons/fa';

const AdvancedSearch = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    owner: '',
    modified: '',
    size: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const clearFilters = () => {
    setFilters({ type: '', owner: '', modified: '', size: '' });
    setQuery('');
    onSearch('', {});
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search in Drive"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            style={styles.filterBtn}
          >
            <FaFilter />
          </button>
        </div>
      </form>

      {showFilters && (
        <div style={styles.filtersPanel}>
          <div style={styles.filterRow}>
            <label style={styles.filterLabel}>Type:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="">All types</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div style={styles.filterRow}>
            <label style={styles.filterLabel}>Modified:</label>
            <select
              value={filters.modified}
              onChange={(e) => setFilters({...filters, modified: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="">Any time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </div>

          <div style={styles.filterRow}>
            <label style={styles.filterLabel}>Size:</label>
            <select
              value={filters.size}
              onChange={(e) => setFilters({...filters, size: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="">Any size</option>
              <option value="small">Small (< 1MB)</option>
              <option value="medium">Medium (1-10MB)</option>
              <option value="large">Large (> 10MB)</option>
            </select>
          </div>

          <div style={styles.filterActions}>
            <button onClick={clearFilters} style={styles.clearBtn}>
              <FaTimes /> Clear
            </button>
            <button onClick={handleSearch} style={styles.applyBtn}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative'
  },
  searchForm: {
    width: '100%'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#f1f3f4',
    borderRadius: '8px',
    padding: '0 16px',
    height: '48px'
  },
  searchIcon: {
    color: '#5f6368',
    marginRight: '12px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '16px'
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#5f6368',
    borderRadius: '4px'
  },
  filtersPanel: {
    position: 'absolute',
    top: '56px',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 100
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '12px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '80px',
    color: '#202124'
  },
  filterSelect: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px'
  },
  filterActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0'
  },
  clearBtn: {
    background: 'none',
    border: '1px solid #dadce0',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  applyBtn: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default AdvancedSearch;