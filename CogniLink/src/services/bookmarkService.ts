/**
 * 书签服务层
 * 整合数据库操作和搜索索引
 */

import { Bookmark, Category, Tag, SearchOptions, SearchResult } from '../types';
import { db } from '../db/database';
import { searchIndex } from './searchIndex';
import { IdGenerator } from '../utils/idGenerator';

export class BookmarkService {
  private initialized = false;

  /**
   * 初始化服务（加载数据并重建索引）
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await db.init();
    const bookmarks = await db.getAllBookmarks();
    searchIndex.rebuildIndex(bookmarks);
    this.initialized = true;
  }

  /**
   * 创建书签
   */
  async createBookmark(bookmarkData: Partial<Bookmark>): Promise<Bookmark> {
    await this.initialize();

    const now = Date.now();
    const bookmark: Bookmark = {
      id: IdGenerator.generate(),
      title: bookmarkData.title || '无标题',
      url: bookmarkData.url || '',
      description: bookmarkData.description,
      notes: bookmarkData.notes,
      categoryId: bookmarkData.categoryId,
      tags: bookmarkData.tags || [],
      createdAt: bookmarkData.createdAt || now,
      updatedAt: now,
      favorite: bookmarkData.favorite || false,
      archived: bookmarkData.archived || false,
    };

    await db.addBookmark(bookmark);
    searchIndex.addBookmark(bookmark);

    // 更新标签使用计数
    await this.updateTagUsageCounts(bookmark.tags, 1);

    return bookmark;
  }

  /**
   * 更新书签
   */
  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    await this.initialize();

    const existing = await db.getBookmark(id);
    if (!existing) {
      throw new Error('书签不存在');
    }

    const oldTags = existing.tags;
    const updated: Bookmark = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    await db.updateBookmark(updated);
    searchIndex.updateBookmark(updated);

    // 更新标签使用计数
    const addedTags = updated.tags.filter((tag) => !oldTags.includes(tag));
    const removedTags = oldTags.filter((tag) => !updated.tags.includes(tag));
    await this.updateTagUsageCounts(addedTags, 1);
    await this.updateTagUsageCounts(removedTags, -1);

    return updated;
  }

  /**
   * 删除书签
   */
  async deleteBookmark(id: string): Promise<void> {
    await this.initialize();

    const bookmark = await db.getBookmark(id);
    if (!bookmark) {
      throw new Error('书签不存在');
    }

    await db.deleteBookmark(id);
    searchIndex.removeBookmark(id);

    // 更新标签使用计数
    await this.updateTagUsageCounts(bookmark.tags, -1);
  }

  /**
   * 获取书签
   */
  async getBookmark(id: string): Promise<Bookmark | null> {
    await this.initialize();
    return await db.getBookmark(id);
  }

  /**
   * 获取所有书签
   */
  async getAllBookmarks(): Promise<Bookmark[]> {
    await this.initialize();
    return await db.getAllBookmarks();
  }

  /**
   * 搜索书签
   */
  async searchBookmarks(options: SearchOptions): Promise<SearchResult[]> {
    await this.initialize();
    return searchIndex.search(options);
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(id: string): Promise<Bookmark> {
    const bookmark = await this.getBookmark(id);
    if (!bookmark) {
      throw new Error('书签不存在');
    }
    return await this.updateBookmark(id, { favorite: !bookmark.favorite });
  }

  /**
   * 切换归档状态
   */
  async toggleArchive(id: string): Promise<Bookmark> {
    const bookmark = await this.getBookmark(id);
    if (!bookmark) {
      throw new Error('书签不存在');
    }
    return await this.updateBookmark(id, { archived: !bookmark.archived });
  }

  /**
   * 更新标签使用计数
   */
  private async updateTagUsageCounts(tagNames: string[], delta: number): Promise<void> {
    for (const tagName of tagNames) {
      const existingTags = await db.getAllTags();
      let tag = existingTags.find((t) => t.name === tagName);

      if (!tag) {
        if (delta > 0) {
          // 创建新标签
          tag = {
            id: IdGenerator.generate(),
            name: tagName,
            createdAt: Date.now(),
            usageCount: 1,
          };
          await db.addTag(tag);
        }
      } else {
        // 更新使用计数
        tag.usageCount = Math.max(0, tag.usageCount + delta);
        if (tag.usageCount === 0) {
          // 可选：删除未使用的标签
          // await db.deleteTag(tag.id);
        } else {
          await db.updateTag(tag);
        }
      }
    }
  }
}

export class CategoryService {
  /**
   * 创建分类
   */
  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    await db.init();

    const now = Date.now();
    const category: Category = {
      id: IdGenerator.generate(),
      name: categoryData.name || '未命名分类',
      description: categoryData.description,
      color: categoryData.color,
      icon: categoryData.icon,
      parentId: categoryData.parentId,
      createdAt: categoryData.createdAt || now,
      updatedAt: now,
    };

    await db.addCategory(category);
    return category;
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await db.init();

    const existing = await db.getCategory(id);
    if (!existing) {
      throw new Error('分类不存在');
    }

    const updated: Category = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    await db.updateCategory(updated);
    return updated;
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    await db.init();

    // 检查是否有子分类
    const allCategories = await db.getAllCategories();
    const hasChildren = allCategories.some((cat) => cat.parentId === id);

    if (hasChildren) {
      throw new Error('无法删除包含子分类的分类');
    }

    // 检查是否有书签使用此分类
    const bookmarks = await db.getBookmarksByCategory(id);
    if (bookmarks.length > 0) {
      throw new Error('无法删除仍有关联书签的分类');
    }

    await db.deleteCategory(id);
  }

  /**
   * 获取分类
   */
  async getCategory(id: string): Promise<Category | null> {
    await db.init();
    return await db.getCategory(id);
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<Category[]> {
    await db.init();
    return await db.getAllCategories();
  }

  /**
   * 获取分类树
   */
  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.getAllCategories();
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // 构建映射
    categories.forEach((cat) => {
      categoryMap.set(cat.id, cat);
    });

    // 构建树结构
    categories.forEach((cat) => {
      if (!cat.parentId) {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }
}

export class TagService {
  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<Tag[]> {
    await db.init();
    return await db.getAllTags();
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const tags = await this.getAllTags();
    return tags
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * 更新标签颜色
   */
  async updateTagColor(id: string, color: string): Promise<Tag> {
    await db.init();

    const existing = await db.getTag(id);
    if (!existing) {
      throw new Error('标签不存在');
    }

    const updated: Tag = {
      ...existing,
      color,
    };

    await db.updateTag(updated);
    return updated;
  }
}

// 单例实例
export const bookmarkService = new BookmarkService();
export const categoryService = new CategoryService();
export const tagService = new TagService();

