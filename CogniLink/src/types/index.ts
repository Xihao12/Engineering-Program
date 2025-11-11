/**
 * CogniLink 核心类型定义
 */

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  categoryId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
  archived: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
  usageCount: number;
}

export interface SearchResult {
  bookmark: Bookmark;
  score: number;
  matchedFields: string[];
}

export interface SearchOptions {
  query: string;
  categoryId?: string;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface IndexedTerm {
  term: string;
  bookmarks: Map<string, number>; // bookmarkId -> frequency
}

export interface DatabaseSchema {
  version: number;
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
}

