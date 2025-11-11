import { Category } from '../../types';
import './CategoryItem.css';

interface CategoryItemProps {
  category: Category;
  bookmarkCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryItem({
  category,
  bookmarkCount,
  isSelected,
  onClick,
}: CategoryItemProps) {
  return (
    <div
      className={`category-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      style={
        isSelected && category.color
          ? { backgroundColor: `${category.color}20`, borderLeftColor: category.color }
          : {}
      }
    >
      <div className="category-item-content">
        {category.icon && <span className="category-item-icon">{category.icon}</span>}
        <span className="category-item-name">{category.name}</span>
      </div>
      <span className="category-item-count">{bookmarkCount}</span>
    </div>
  );
}

