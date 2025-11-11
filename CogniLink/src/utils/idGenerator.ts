/**
 * Unique ID Generator
 */
export class IdGenerator {
  /**
   * Generate Unique ID
   */
  static generate(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate timestamp-based ID
   */
  static generateTimestampId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}


