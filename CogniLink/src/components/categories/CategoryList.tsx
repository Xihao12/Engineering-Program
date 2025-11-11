import { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import CategoryItem from './CategoryItem';
import CategoryFormModal from './CategoryFormModal';
import Button from '../ui/Button';
import './CategoryList.css';

export default function CategoryList() {
  const { categories } = useCategories();
  const { bookmarks, searchBookmarks } = useBookmarks();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
    } else {
      setSelectedCategoryId(categoryId);
      searchBookmarks({
        query: '',
        categoryId,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    }
  };

  const getBookmarkCount = (categoryId: string) => {
    return bookmarks.filter((b) => b.categoryId === categoryId).length;
  };

  return (
    <div className="category-list">
      <div className="category-list-header">
        <Button
          variant="primary"
          size="small"
          onClick={() => setIsAddModalOpen(true)}
        >
          添加分类
        </Button>
      </div>
      <div className="category-list-items">
        <div
          className={`category-list-item ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategoryId(null);
            searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
          }}
        >
          <span className="category-list-item-name">全部</span>
          <span className="category-list-item-count">{bookmarks.length}</span>
        </div>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            bookmarkCount={getBookmarkCount(category.id)}
            isSelected={selectedCategoryId === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>
      {isAddModalOpen && (
        <CategoryFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}

