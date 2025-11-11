import { Bookmark } from '../../types';
import BookmarkCard from './BookmarkCard';
import './BookmarkList.css';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function BookmarkList({ bookmarks, selectedId, onSelect }: BookmarkListProps) {
  return (
    <div className="bookmark-list">
      <div className="bookmark-list-header">
        <h2 className="bookmark-list-title">书签 ({bookmarks.length})</h2>
      </div>
      <div className="bookmark-list-items">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            isSelected={bookmark.id === selectedId}
            onClick={() => onSelect(bookmark.id)}
          />
        ))}
      </div>
    </div>
  );
}

