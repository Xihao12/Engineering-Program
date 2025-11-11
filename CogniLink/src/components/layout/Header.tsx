import { useState } from 'react';
import SearchBar from '../search/SearchBar';
import Button from '../ui/Button';
import BookmarkFormModal from '../bookmarks/BookmarkFormModal';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-button" onClick={onToggleSidebar}>
          ☰
        </button>
        <h1 className="header-title">CogniLink</h1>
      </div>
      <div className="header-center">
        <SearchBar />
      </div>
      <div className="header-right">
        <Button onClick={() => setIsAddModalOpen(true)}>添加书签</Button>
      </div>
      {isAddModalOpen && (
        <BookmarkFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </header>
  );
}

