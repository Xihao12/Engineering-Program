import { useState, useEffect } from 'react';
import { Bookmark } from '../../types';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useCategories } from '../../contexts/CategoryContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import TagInput from '../tags/TagInput';
import './BookmarkFormModal.css';

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark?: Bookmark;
}

export default function BookmarkFormModal({
  isOpen,
  onClose,
  bookmark,
}: BookmarkFormModalProps) {
  const { addBookmark, updateBookmark } = useBookmarks();
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    notes: '',
    categoryId: '',
    tags: [] as string[],
    favorite: false,
    archived: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || '',
        notes: bookmark.notes || '',
        categoryId: bookmark.categoryId || '',
        tags: bookmark.tags || [],
        favorite: bookmark.favorite,
        archived: bookmark.archived,
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        notes: '',
        categoryId: '',
        tags: [],
        favorite: false,
        archived: false,
      });
    }
    setErrors({});
  }, [bookmark, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL不能为空';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = '请输入有效的URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (bookmark) {
        await updateBookmark(bookmark.id, formData);
      } else {
        await addBookmark(formData);
      }
      onClose();
    } catch (error) {
      console.error('保存书签失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookmark ? '编辑书签' : '添加书签'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="bookmark-form">
        <Input
          label="标题 *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          placeholder="输入书签标题"
        />
        <Input
          label="URL *"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          error={errors.url}
          placeholder="https://example.com"
        />
        <Textarea
          label="描述"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="输入书签描述"
          rows={3}
        />
        <Textarea
          label="备注"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="输入备注信息"
          rows={5}
        />
        <div className="bookmark-form-group">
          <label className="bookmark-form-label">分类</label>
          <select
            className="bookmark-form-select"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">无分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bookmark-form-group">
          <label className="bookmark-form-label">标签</label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
          />
        </div>
        <div className="bookmark-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : bookmark ? '更新' : '添加'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

