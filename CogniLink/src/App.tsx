import { useEffect, useState } from 'react';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { TagProvider } from './contexts/TagContext';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化应用
    const initApp = async () => {
      try {
        // 预加载数据
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('应用初始化失败:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BookmarkProvider>
      <CategoryProvider>
        <TagProvider>
          <MainLayout />
        </TagProvider>
      </CategoryProvider>
    </BookmarkProvider>
  );
}

export default App;

