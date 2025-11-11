import { useState, useEffect } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import './SearchBar.css';

export default function SearchBar() {
  const { searchBookmarks } = useBookmarks();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      searchBookmarks({
        query,
        sortBy: query ? 'relevance' : 'updatedAt',
        sortOrder: 'desc',
      });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar-input"
        placeholder="搜索书签..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="search-bar-icon">🔍</span>
    </div>
  );
}

