/**
 * 唯一ID生成器
 */
export class IdGenerator {
  /**
   * 生成唯一的ID
   */
  static generate(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成基于时间戳的ID
   */
  static generateTimestampId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

