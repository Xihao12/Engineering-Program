import { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import CategoryList from '../categories/CategoryList';
import TagCloud from '../tags/TagCloud';
import FilterPanel from '../filters/FilterPanel';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { categories } = useCategories();
  const { bookmarks } = useBookmarks();
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'filters'>('categories');

  const favoriteCount = bookmarks.filter((b) => b.favorite).length;
  const archivedCount = bookmarks.filter((b) => b.archived).length;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">导航</h2>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            分类
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            标签
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'filters' ? 'active' : ''}`}
            onClick={() => setActiveTab('filters')}
          >
            筛选
          </button>
        </div>
        <div className="sidebar-content">
          {activeTab === 'categories' && <CategoryList />}
          {activeTab === 'tags' && <TagCloud />}
          {activeTab === 'filters' && <FilterPanel />}
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <div className="sidebar-stat">
              <span className="stat-label">收藏</span>
              <span className="stat-value">{favoriteCount}</span>
            </div>
            <div className="sidebar-stat">
              <span className="stat-label">归档</span>
              <span className="stat-value">{archivedCount}</span>
            </div>
            <div className="sidebar-stat">
              <span className="stat-label">总计</span>
              <span className="stat-value">{bookmarks.length}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

