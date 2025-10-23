// Performance Monitor for tracking wallet data loading performance

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  fromCache: boolean;
  dataSize?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  cacheHitRate: number;
  slowestOperations: PerformanceMetric[];
  fastestOperations: PerformanceMetric[];
  operationCounts: Record<string, number>;
  operationAverages: Record<string, number>;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static maxMetrics = 1000; // Keep last 1000 metrics
  private static enabled = process.env.NODE_ENV === 'development';

  /**
   * Start timing an operation
   */
  static startTiming(_operation: string): number {
    if (!this.enabled) return 0;
    return performance.now();
  }

  /**
   * End timing and record metric
   */
  static endTiming(
    operation: string,
    startTime: number,
    fromCache: boolean = false,
    dataSize?: number,
    metadata?: Record<string, any>
  ): number {
    if (!this.enabled) return 0;

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      operation,
      startTime,
      endTime,
      duration,
      fromCache,
      dataSize,
      metadata
    };

    this.addMetric(metric);
    return duration;
  }

  /**
   * Time an async operation
   */
  static async timeAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; duration: number; fromCache: boolean }> {
    if (!this.enabled) {
      const result = await fn();
      return { result, duration: 0, fromCache: false };
    }

    const startTime = this.startTiming(operation);
    const result = await fn();
    
    // Try to detect if result came from cache
    const fromCache = metadata?.fromCache || false;
    const dataSize = this.estimateDataSize(result);
    
    const duration = this.endTiming(operation, startTime, fromCache, dataSize, metadata);
    
    return { result, duration, fromCache };
  }

  /**
   * Time a synchronous operation
   */
  static timeSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): { result: T; duration: number; fromCache: boolean } {
    if (!this.enabled) {
      const result = fn();
      return { result, duration: 0, fromCache: false };
    }

    const startTime = this.startTiming(operation);
    const result = fn();
    
    const fromCache = metadata?.fromCache || false;
    const dataSize = this.estimateDataSize(result);
    
    const duration = this.endTiming(operation, startTime, fromCache, dataSize, metadata);
    
    return { result, duration, fromCache };
  }

  /**
   * Get performance statistics
   */
  static getStats(): PerformanceStats {
    if (!this.enabled || this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        cacheHitRate: 0,
        slowestOperations: [],
        fastestOperations: [],
        operationCounts: {},
        operationAverages: {}
      };
    }

    const totalOperations = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / totalOperations;
    
    const cacheHits = this.metrics.filter(m => m.fromCache).length;
    const cacheHitRate = (cacheHits / totalOperations) * 100;

    // Sort by duration for slowest/fastest
    const sortedByDuration = [...this.metrics].sort((a, b) => b.duration - a.duration);
    const slowestOperations = sortedByDuration.slice(0, 10);
    const fastestOperations = sortedByDuration.slice(-10).reverse();

    // Count operations by type
    const operationCounts: Record<string, number> = {};
    const operationTotals: Record<string, number> = {};
    
    for (const metric of this.metrics) {
      operationCounts[metric.operation] = (operationCounts[metric.operation] || 0) + 1;
      operationTotals[metric.operation] = (operationTotals[metric.operation] || 0) + metric.duration;
    }

    // Calculate averages per operation type
    const operationAverages: Record<string, number> = {};
    for (const [operation, count] of Object.entries(operationCounts)) {
      operationAverages[operation] = operationTotals[operation] / count;
    }

    return {
      totalOperations,
      averageDuration,
      cacheHitRate,
      slowestOperations,
      fastestOperations,
      operationCounts,
      operationAverages
    };
  }

  /**
   * Get metrics for a specific operation
   */
  static getOperationMetrics(operation: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable performance monitoring
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Log performance summary to console
   */
  static logSummary(): void {
    if (!this.enabled) return;

    const stats = this.getStats();
    
    console.group('🚀 Multi-Wallet Performance Summary');
    console.log(`Total Operations: ${stats.totalOperations}`);
    console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`Cache Hit Rate: ${stats.cacheHitRate.toFixed(1)}%`);
    
    console.group('Operation Averages:');
    for (const [operation, average] of Object.entries(stats.operationAverages)) {
      const count = stats.operationCounts[operation];
      console.log(`${operation}: ${average.toFixed(2)}ms (${count} ops)`);
    }
    console.groupEnd();

    if (stats.slowestOperations.length > 0) {
      console.group('Slowest Operations:');
      stats.slowestOperations.slice(0, 5).forEach((metric, index) => {
        console.log(`${index + 1}. ${metric.operation}: ${metric.duration.toFixed(2)}ms ${metric.fromCache ? '(cached)' : '(storage)'}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Get performance recommendations
   */
  static getRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];

    if (stats.cacheHitRate < 50) {
      recommendations.push('Cache hit rate is low. Consider increasing cache TTL or preloading frequently accessed data.');
    }

    if (stats.averageDuration > 100) {
      recommendations.push('Average operation duration is high. Consider optimizing data loading or adding more caching.');
    }

    // Check for operations that are consistently slow
    for (const [operation, average] of Object.entries(stats.operationAverages)) {
      if (average > 200) {
        recommendations.push(`Operation "${operation}" is consistently slow (${average.toFixed(2)}ms average). Consider optimization.`);
      }
    }

    // Check for operations with low cache hit rates
    const operationMetrics = this.groupMetricsByOperation();
    for (const [operation, metrics] of Object.entries(operationMetrics)) {
      const cacheHits = metrics.filter(m => m.fromCache).length;
      const hitRate = (cacheHits / metrics.length) * 100;
      
      if (hitRate < 30 && metrics.length > 5) {
        recommendations.push(`Operation "${operation}" has low cache hit rate (${hitRate.toFixed(1)}%). Consider caching strategy.`);
      }
    }

    return recommendations;
  }

  // Private helper methods

  private static addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private static estimateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private static groupMetricsByOperation(): Record<string, PerformanceMetric[]> {
    const grouped: Record<string, PerformanceMetric[]> = {};
    
    for (const metric of this.metrics) {
      if (!grouped[metric.operation]) {
        grouped[metric.operation] = [];
      }
      grouped[metric.operation].push(metric);
    }

    return grouped;
  }
}

// Auto-log summary in development every 2 minutes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = PerformanceMonitor.getStats();
    if (stats.totalOperations > 10) {
      PerformanceMonitor.logSummary();
    }
  }, 2 * 60 * 1000);
}