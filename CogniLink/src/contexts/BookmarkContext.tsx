import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Bookmark, SearchOptions, SearchResult } from '../types';
import { bookmarkService } from '../services/bookmarkService';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  addBookmark: (bookmark: Partial<Bookmark>) => Promise<Bookmark>;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<Bookmark>;
  deleteBookmark: (id: string) => Promise<void>;
  getBookmark: (id: string) => Promise<Bookmark | null>;
  searchBookmarks: (options: SearchOptions) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  refreshBookmarks: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookmarkService.getAllBookmarks();
      setBookmarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载书签失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bookmarkService.initialize().then(() => {
      refreshBookmarks();
    });
  }, []);

  const addBookmark = async (bookmarkData: Partial<Bookmark>) => {
    try {
      setError(null);
      const bookmark = await bookmarkService.createBookmark(bookmarkData);
      setBookmarks((prev) => [...prev, bookmark]);
      return bookmark;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加书签失败';
      setError(errorMessage);
      throw err;
    }
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      setError(null);
      const updated = await bookmarkService.updateBookmark(id, updates);
      setBookmarks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setSearchResults((prev) =>
        prev.map((r) => (r.bookmark.id === id ? { ...r, bookmark: updated } : r))
      );
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新书签失败';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      setError(null);
      await bookmarkService.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      setSearchResults((prev) => prev.filter((r) => r.bookmark.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除书签失败';
      setError(errorMessage);
      throw err;
    }
  };

  const getBookmark = async (id: string) => {
    try {
      setError(null);
      return await bookmarkService.getBookmark(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取书签失败';
      setError(errorMessage);
      return null;
    }
  };

  const searchBookmarks = async (options: SearchOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await bookmarkService.searchBookmarks(options);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      setError(null);
      const updated = await bookmarkService.toggleFavorite(id);
      setBookmarks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setSearchResults((prev) =>
        prev.map((r) => (r.bookmark.id === id ? { ...r, bookmark: updated } : r))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(errorMessage);
    }
  };

  const toggleArchive = async (id: string) => {
    try {
      setError(null);
      const updated = await bookmarkService.toggleArchive(id);
      setBookmarks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setSearchResults((prev) =>
        prev.map((r) => (r.bookmark.id === id ? { ...r, bookmark: updated } : r))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(errorMessage);
    }
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        searchResults,
        isLoading,
        error,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        getBookmark,
        searchBookmarks,
        toggleFavorite,
        toggleArchive,
        refreshBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks必须在BookmarkProvider中使用');
  }
  return context;
}

