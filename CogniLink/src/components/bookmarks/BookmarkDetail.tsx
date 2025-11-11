import { useEffect, useState } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useCategories } from '../../contexts/CategoryContext';
import { Bookmark } from '../../types';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import BookmarkFormModal from './BookmarkFormModal';
import './BookmarkDetail.css';

interface BookmarkDetailProps {
  bookmarkId: string;
  onClose: () => void;
}

export default function BookmarkDetail({ bookmarkId, onClose }: BookmarkDetailProps) {
  const { getBookmark, deleteBookmark, toggleFavorite, toggleArchive, bookmarks } = useBookmarks();
  const { categories } = useCategories();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 从context中获取最新书签数据
  useEffect(() => {
    const bookmarkFromContext = bookmarks.find((b) => b.id === bookmarkId);
    if (bookmarkFromContext) {
      setBookmark(bookmarkFromContext);
      setIsLoading(false);
    } else {
      // 如果context中没有，从数据库加载
      const loadBookmark = async () => {
        setIsLoading(true);
        const data = await getBookmark(bookmarkId);
        setBookmark(data);
        setIsLoading(false);
      };
      loadBookmark();
    }
  }, [bookmarkId, bookmarks, getBookmark]);

  const handleDelete = async () => {
    if (window.confirm('确定要删除这个书签吗？')) {
      await deleteBookmark(bookmarkId);
      onClose();
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(bookmarkId);
    const updated = await getBookmark(bookmarkId);
    if (updated) {
      setBookmark(updated);
    }
  };

  const handleToggleArchive = async () => {
    await toggleArchive(bookmarkId);
    const updated = await getBookmark(bookmarkId);
    if (updated) {
      setBookmark(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="bookmark-detail">
        <LoadingSpinner />
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="bookmark-detail">
        <div className="bookmark-detail-error">书签不存在</div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === bookmark.categoryId);

  return (
    <div className="bookmark-detail">
      <div className="bookmark-detail-header">
        <div className="bookmark-detail-actions">
          <Button variant="ghost" size="small" onClick={handleToggleFavorite}>
            {bookmark.favorite ? '★ 取消收藏' : '☆ 收藏'}
          </Button>
          <Button variant="ghost" size="small" onClick={handleToggleArchive}>
            {bookmark.archived ? '取消归档' : '归档'}
          </Button>
          <Button variant="ghost" size="small" onClick={() => setIsEditModalOpen(true)}>
            编辑
          </Button>
          <Button variant="danger" size="small" onClick={handleDelete}>
            删除
          </Button>
        </div>
        <button className="bookmark-detail-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="bookmark-detail-content">
        <h1 className="bookmark-detail-title">{bookmark.title}</h1>
        <div className="bookmark-detail-meta">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bookmark-detail-url"
          >
            {bookmark.url}
          </a>
        </div>
        {category && (
          <div className="bookmark-detail-category">
            <span
              className="bookmark-detail-category-badge"
              style={{ backgroundColor: category.color || '#e5e7eb' }}
            >
              {category.name}
            </span>
          </div>
        )}
        {bookmark.description && (
          <div className="bookmark-detail-section">
            <h2 className="bookmark-detail-section-title">描述</h2>
            <p className="bookmark-detail-text">{bookmark.description}</p>
          </div>
        )}
        {bookmark.notes && (
          <div className="bookmark-detail-section">
            <h2 className="bookmark-detail-section-title">备注</h2>
            <p className="bookmark-detail-text">{bookmark.notes}</p>
          </div>
        )}
        {bookmark.tags.length > 0 && (
          <div className="bookmark-detail-section">
            <h2 className="bookmark-detail-section-title">标签</h2>
            <div className="bookmark-detail-tags">
              {bookmark.tags.map((tag) => (
                <span key={tag} className="bookmark-detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="bookmark-detail-footer">
          <div className="bookmark-detail-date">
            创建于: {new Date(bookmark.createdAt).toLocaleString('zh-CN')}
          </div>
          <div className="bookmark-detail-date">
            更新于: {new Date(bookmark.updatedAt).toLocaleString('zh-CN')}
          </div>
        </div>
      </div>
      {isEditModalOpen && bookmark && (
        <BookmarkFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            // 编辑后刷新书签数据
            const updatedBookmark = bookmarks.find((b) => b.id === bookmarkId);
            if (updatedBookmark) {
              setBookmark(updatedBookmark);
            }
          }}
          bookmark={bookmark}
        />
      )}
    </div>
  );
}

