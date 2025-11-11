/**
 * 自定义搜索索引模块
 * 实现倒排索引机制，提供全文搜索功能
 */

import { Bookmark, SearchResult, SearchOptions, IndexedTerm } from '../types';

export class SearchIndex {
  private index: Map<string, IndexedTerm> = new Map();
  private bookmarks: Map<string, Bookmark> = new Map();

  /**
   * 文本分词（简单实现，支持中英文）
   */
  private tokenize(text: string): string[] {
    if (!text) return [];

    // 移除特殊字符，转换为小写
    const normalized = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .trim();

    if (!normalized) return [];

    // 中文字符单独分词，英文单词按空格分割
    const tokens: string[] = [];
    let currentWord = '';

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      const charCode = char.charCodeAt(0);

      // 中文字符范围
      if (charCode >= 0x4e00 && charCode <= 0x9fa5) {
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
        tokens.push(char);
      } else if (/\s/.test(char)) {
        // 空格分隔
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
      } else {
        // 英文数字字符
        currentWord += char;
      }
    }

    if (currentWord) {
      tokens.push(currentWord);
    }

    // 过滤空字符串和过短的词
    return tokens.filter((token) => token.length > 0);
  }

  /**
   * 提取文档的所有词条
   */
  private extractTerms(bookmark: Bookmark): string[] {
    const terms: string[] = [];

    // 标题
    if (bookmark.title) {
      terms.push(...this.tokenize(bookmark.title));
    }

    // 描述
    if (bookmark.description) {
      terms.push(...this.tokenize(bookmark.description));
    }

    // 备注
    if (bookmark.notes) {
      terms.push(...this.tokenize(bookmark.notes));
    }

    // URL（提取域名）
    if (bookmark.url) {
      try {
        const url = new URL(bookmark.url);
        terms.push(...this.tokenize(url.hostname));
        terms.push(...this.tokenize(url.pathname));
      } catch {
        terms.push(...this.tokenize(bookmark.url));
      }
    }

    // 标签
    bookmark.tags.forEach((tag) => {
      terms.push(...this.tokenize(tag));
    });

    return terms;
  }

  /**
   * 添加书签到索引
   */
  addBookmark(bookmark: Bookmark): void {
    this.bookmarks.set(bookmark.id, bookmark);
    const terms = this.extractTerms(bookmark);

    terms.forEach((term) => {
      if (!this.index.has(term)) {
        this.index.set(term, {
          term,
          bookmarks: new Map(),
        });
      }

      const indexEntry = this.index.get(term)!;
      const currentCount = indexEntry.bookmarks.get(bookmark.id) || 0;
      indexEntry.bookmarks.set(bookmark.id, currentCount + 1);
    });
  }

  /**
   * 更新书签索引
   */
  updateBookmark(bookmark: Bookmark): void {
    this.removeBookmark(bookmark.id);
    this.addBookmark(bookmark);
  }

  /**
   * 从索引中移除书签
   */
  removeBookmark(bookmarkId: string): void {
    const bookmark = this.bookmarks.get(bookmarkId);
    if (!bookmark) return;

    this.bookmarks.delete(bookmarkId);

    // 更新索引
    const terms = this.extractTerms(bookmark);
    terms.forEach((term) => {
      const indexEntry = this.index.get(term);
      if (indexEntry) {
        indexEntry.bookmarks.delete(bookmarkId);
        if (indexEntry.bookmarks.size === 0) {
          this.index.delete(term);
        }
      }
    });
  }

  /**
   * 重建整个索引
   */
  rebuildIndex(bookmarks: Bookmark[]): void {
    this.index.clear();
    this.bookmarks.clear();
    bookmarks.forEach((bookmark) => this.addBookmark(bookmark));
  }

  /**
   * 计算搜索分数（TF-IDF简化版）
   */
  private calculateScore(
    bookmarkId: string,
    queryTerms: string[],
    matchedFields: string[]
  ): number {
    const bookmark = this.bookmarks.get(bookmarkId);
    if (!bookmark) return 0;

    let score = 0;

    queryTerms.forEach((term) => {
      const indexEntry = this.index.get(term);
      if (indexEntry) {
        const frequency = indexEntry.bookmarks.get(bookmarkId) || 0;
        // 基础分数：词频
        score += frequency;

        // 字段权重
        const bookmarkTerms = this.extractTerms(bookmark);
        const termIndex = bookmarkTerms.indexOf(term);

        if (termIndex !== -1) {
          // 标题匹配权重最高
          if (
            bookmark.title.toLowerCase().includes(term) &&
            !matchedFields.includes('title')
          ) {
            matchedFields.push('title');
            score += 10;
          }
          // 标签匹配权重较高
          if (
            bookmark.tags.some((tag) => tag.toLowerCase().includes(term)) &&
            !matchedFields.includes('tags')
          ) {
            matchedFields.push('tags');
            score += 8;
          }
          // 描述匹配
          if (
            bookmark.description?.toLowerCase().includes(term) &&
            !matchedFields.includes('description')
          ) {
            matchedFields.push('description');
            score += 5;
          }
          // 备注匹配
          if (
            bookmark.notes?.toLowerCase().includes(term) &&
            !matchedFields.includes('notes')
          ) {
            matchedFields.push('notes');
            score += 3;
          }
        }
      }
    });

    return score;
  }

  /**
   * 搜索书签
   */
  search(options: SearchOptions): SearchResult[] {
    const {
      query,
      categoryId,
      tags,
      favorite,
      archived,
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit,
    } = options;

    const queryTerms = this.tokenize(query);
    const results: SearchResult[] = [];

    // 如果查询为空，返回所有书签（应用过滤条件）
    if (queryTerms.length === 0) {
      this.bookmarks.forEach((bookmark) => {
        if (this.matchesFilters(bookmark, { categoryId, tags, favorite, archived })) {
          results.push({
            bookmark,
            score: 0,
            matchedFields: [],
          });
        }
      });
    } else {
      // 使用倒排索引搜索
      const bookmarkScores = new Map<string, { score: number; matchedFields: string[] }>();

      queryTerms.forEach((term) => {
        const indexEntry = this.index.get(term);
        if (indexEntry) {
          indexEntry.bookmarks.forEach((frequency, bookmarkId) => {
            if (!bookmarkScores.has(bookmarkId)) {
              bookmarkScores.set(bookmarkId, { score: 0, matchedFields: [] });
            }
          });
        }
      });

      // 计算每个书签的分数
      bookmarkScores.forEach((data, bookmarkId) => {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (bookmark && this.matchesFilters(bookmark, { categoryId, tags, favorite, archived })) {
          data.score = this.calculateScore(bookmarkId, queryTerms, data.matchedFields);
          results.push({
            bookmark,
            score: data.score,
            matchedFields: data.matchedFields,
          });
        }
      });
    }

    // 排序
    results.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'relevance') {
        comparison = b.score - a.score;
      } else if (sortBy === 'title') {
        comparison = a.bookmark.title.localeCompare(b.bookmark.title);
      } else if (sortBy === 'createdAt') {
        comparison = a.bookmark.createdAt - b.bookmark.createdAt;
      } else if (sortBy === 'updatedAt') {
        comparison = a.bookmark.updatedAt - b.bookmark.updatedAt;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // 限制结果数量
    if (limit && limit > 0) {
      return results.slice(0, limit);
    }

    return results;
  }

  /**
   * 检查书签是否匹配过滤条件
   */
  private matchesFilters(
    bookmark: Bookmark,
    filters: {
      categoryId?: string;
      tags?: string[];
      favorite?: boolean;
      archived?: boolean;
    }
  ): boolean {
    if (filters.categoryId && bookmark.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => bookmark.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    if (filters.favorite !== undefined && bookmark.favorite !== filters.favorite) {
      return false;
    }

    if (filters.archived !== undefined && bookmark.archived !== filters.archived) {
      return false;
    }

    return true;
  }

  /**
   * 获取索引统计信息
   */
  getStats(): { totalTerms: number; totalBookmarks: number } {
    return {
      totalTerms: this.index.size,
      totalBookmarks: this.bookmarks.size,
    };
  }
}

// 单例实例
export const searchIndex = new SearchIndex();

