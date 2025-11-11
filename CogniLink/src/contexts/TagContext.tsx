import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Tag } from '../types';
import { tagService } from '../services/bookmarkService';

interface TagContextType {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  getPopularTags: (limit?: number) => Promise<Tag[]>;
  updateTagColor: (id: string, color: string) => Promise<Tag>;
  refreshTags: () => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export function TagProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTags = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tagService.getAllTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载标签失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTags();
  }, []);

  const getPopularTags = async (limit: number = 10) => {
    try {
      setError(null);
      return await tagService.getPopularTags(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取标签失败');
      return [];
    }
  };

  const updateTagColor = async (id: string, color: string) => {
    try {
      setError(null);
      const updated = await tagService.updateTagColor(id, color);
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新标签失败';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <TagContext.Provider
      value={{
        tags,
        isLoading,
        error,
        getPopularTags,
        updateTagColor,
        refreshTags,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags必须在TagProvider中使用');
  }
  return context;
}

