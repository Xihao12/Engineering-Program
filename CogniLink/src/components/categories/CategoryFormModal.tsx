import { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useCategories } from '../../contexts/CategoryContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import './CategoryFormModal.css';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const { addCategory, updateCategory } = useCategories();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3b82f6',
        icon: category.icon || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '',
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '分类名称不能为空';
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
      if (category) {
        await updateCategory(category.id, formData);
      } else {
        await addCategory(formData);
      }
      onClose();
    } catch (error) {
      console.error('保存分类失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? '编辑分类' : '添加分类'}
      size="small"
    >
      <form onSubmit={handleSubmit} className="category-form">
        <Input
          label="分类名称 *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="输入分类名称"
        />
        <Textarea
          label="描述"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="输入分类描述"
          rows={3}
        />
        <div className="category-form-group">
          <label className="category-form-label">颜色</label>
          <div className="category-form-color-group">
            <input
              type="color"
              className="category-form-color-input"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#3b82f6"
            />
          </div>
        </div>
        <Input
          label="图标"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="输入图标（emoji或文本）"
        />
        <div className="category-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : category ? '更新' : '添加'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

