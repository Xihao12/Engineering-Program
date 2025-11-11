import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/bookmarkService';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string) => Promise<Category | null>;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载分类失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const addCategory = async (categoryData: Partial<Category>) => {
    try {
      setError(null);
      const category = await categoryService.createCategory(categoryData);
      setCategories((prev) => [...prev, category]);
      return category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加分类失败';
      setError(errorMessage);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setError(null);
      const updated = await categoryService.updateCategory(id, updates);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新分类失败';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除分类失败';
      setError(errorMessage);
      throw err;
    }
  };

  const getCategory = async (id: string) => {
    try {
      setError(null);
      return await categoryService.getCategory(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取分类失败';
      setError(errorMessage);
      return null;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories必须在CategoryProvider中使用');
  }
  return context;
}

