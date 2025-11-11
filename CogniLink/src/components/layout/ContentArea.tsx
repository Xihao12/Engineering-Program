import { useState } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import BookmarkList from '../bookmarks/BookmarkList';
import BookmarkDetail from '../bookmarks/BookmarkDetail';
import EmptyState from '../ui/EmptyState';
import './ContentArea.css';

interface ContentAreaProps {
  sidebarOpen: boolean;
}

export default function ContentArea({ sidebarOpen }: ContentAreaProps) {
  const { searchResults, bookmarks, isLoading } = useBookmarks();
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);

  const displayBookmarks = searchResults.length > 0 ? searchResults.map(r => r.bookmark) : bookmarks;

  if (isLoading) {
    return (
      <main className={`content-area ${sidebarOpen ? 'with-sidebar' : ''}`}>
        <div className="content-loading">加载中...</div>
      </main>
    );
  }

  return (
    <main className={`content-area ${sidebarOpen ? 'with-sidebar' : ''}`}>
      {displayBookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={`content-area-grid ${selectedBookmarkId ? 'has-detail' : ''}`}>
          <div className="content-area-list">
            <BookmarkList
              bookmarks={displayBookmarks}
              selectedId={selectedBookmarkId}
              onSelect={setSelectedBookmarkId}
            />
          </div>
          {selectedBookmarkId && (
            <div className="content-area-detail">
              <BookmarkDetail
                bookmarkId={selectedBookmarkId}
                onClose={() => setSelectedBookmarkId(null)}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}

