import { useState } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import Button from '../ui/Button';
import './FilterPanel.css';

export default function FilterPanel() {
  const { searchBookmarks } = useBookmarks();
  const [filters, setFilters] = useState({
    favorite: false,
    archived: false,
  });

  const handleFilterToggle = (key: 'favorite' | 'archived') => {
    const newFilters = {
      ...filters,
      [key]: !filters[key],
    };
    setFilters(newFilters);

    searchBookmarks({
      query: '',
      favorite: newFilters.favorite || undefined,
      archived: newFilters.archived || undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  const handleClearFilters = () => {
    setFilters({ favorite: false, archived: false });
    searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-section">
        <h3 className="filter-panel-title">快速筛选</h3>
        <div className="filter-panel-buttons">
          <Button
            variant={filters.favorite ? 'primary' : 'ghost'}
            size="small"
            onClick={() => handleFilterToggle('favorite')}
          >
            {filters.favorite ? '★ 收藏' : '☆ 收藏'}
          </Button>
          <Button
            variant={filters.archived ? 'primary' : 'ghost'}
            size="small"
            onClick={() => handleFilterToggle('archived')}
          >
            {filters.archived ? '📦 归档' : '📦 归档'}
          </Button>
        </div>
      </div>
      {(filters.favorite || filters.archived) && (
        <div className="filter-panel-clear">
          <Button variant="ghost" size="small" onClick={handleClearFilters}>
            清除筛选
          </Button>
        </div>
      )}
    </div>
  );
}

