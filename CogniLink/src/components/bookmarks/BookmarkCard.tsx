import { Bookmark } from '../../types';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useCategories } from '../../contexts/CategoryContext';
import './BookmarkCard.css';

interface BookmarkCardProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onClick: () => void;
}

export default function BookmarkCard({ bookmark, isSelected, onClick }: BookmarkCardProps) {
  const { toggleFavorite } = useBookmarks();
  const { categories } = useCategories();

  const category = categories.find((c) => c.id === bookmark.categoryId);
  let domain = '';
  if (bookmark.url) {
    try {
      domain = new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      domain = bookmark.url;
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(bookmark.id);
  };

  return (
    <div className={`bookmark-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="bookmark-card-header">
        <h3 className="bookmark-card-title">{bookmark.title}</h3>
        <button
          className={`bookmark-card-favorite ${bookmark.favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={bookmark.favorite ? '取消收藏' : '收藏'}
        >
          {bookmark.favorite ? '★' : '☆'}
        </button>
      </div>
      {bookmark.description && (
        <p className="bookmark-card-description">{bookmark.description}</p>
      )}
      <div className="bookmark-card-meta">
        <span className="bookmark-card-domain">{domain}</span>
        {category && (
          <span className="bookmark-card-category" style={{ color: category.color }}>
            {category.name}
          </span>
        )}
      </div>
      {bookmark.tags.length > 0 && (
        <div className="bookmark-card-tags">
          {bookmark.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bookmark-card-tag">
              {tag}
            </span>
          ))}
          {bookmark.tags.length > 3 && (
            <span className="bookmark-card-tag-more">+{bookmark.tags.length - 3}</span>
          )}
        </div>
      )}
      {bookmark.archived && <div className="bookmark-card-archived">已归档</div>}
    </div>
  );
}

