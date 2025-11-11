import { useEffect, useState } from 'react';
import { useTags } from '../../contexts/TagContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import './TagCloud.css';

export default function TagCloud() {
  const { getPopularTags } = useTags();
  const { searchBookmarks } = useBookmarks();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      const popularTags = await getPopularTags(20);
      setTags(popularTags.map((t) => t.name));
    };
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newSelectedTags);

    if (newSelectedTags.length === 0) {
      searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
    } else {
      searchBookmarks({
        query: '',
        tags: newSelectedTags,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    }
  };

  if (tags.length === 0) {
    return <div className="tag-cloud-empty">暂无标签</div>;
  }

  return (
    <div className="tag-cloud">
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-cloud-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

