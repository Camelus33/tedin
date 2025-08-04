import { loggingService } from './LoggingService';

/**
 * Performance Monitor Service
 * Tracks and analyzes search performance metrics
 */
export class PerformanceMonitorService {
  private metrics: Map<string, any[]> = new Map();
  private readonly MAX_METRICS_HISTORY = 1000;

  /**
   * Record performance metric
   */
  recordMetric(
    operation: string,
    duration: number,
    metadata: any = {}
  ) {
    try {
      const metric = {
        timestamp: Date.now(),
        operation,
        duration,
        metadata,
      };

      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }

      const operationMetrics = this.metrics.get(operation)!;
      operationMetrics.push(metric);

      // Keep only recent metrics
      if (operationMetrics.length > this.MAX_METRICS_HISTORY) {
        operationMetrics.splice(0, operationMetrics.length - this.MAX_METRICS_HISTORY);
      }

      // Log performance metric
      loggingService.logPerformance(operation, duration, metadata);
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getOperationStats(operation: string, timeWindow: number = 24 * 60 * 60 * 1000): any {
    try {
      const operationMetrics = this.metrics.get(operation) || [];
      const now = Date.now();
      const recentMetrics = operationMetrics.filter(
        metric => now - metric.timestamp < timeWindow
      );

      if (recentMetrics.length === 0) {
        return {
          operation,
          count: 0,
          avgDuration: 0,
          minDuration: 0,
          maxDuration: 0,
          p95Duration: 0,
          p99Duration: 0,
        };
      }

      const durations = recentMetrics.map(m => m.duration).sort((a, b) => a - b);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const minDuration = durations[0];
      const maxDuration = durations[durations.length - 1];
      const p95Index = Math.floor(durations.length * 0.95);
      const p99Index = Math.floor(durations.length * 0.99);
      const p95Duration = durations[p95Index] || maxDuration;
      const p99Duration = durations[p99Index] || maxDuration;

      return {
        operation,
        count: recentMetrics.length,
        avgDuration: Math.round(avgDuration),
        minDuration,
        maxDuration,
        p95Duration,
        p99Duration,
        timeWindow: `${timeWindow / (60 * 60 * 1000)}h`,
      };
    } catch (error) {
      console.error('Error getting operation stats:', error);
      return {};
    }
  }

  /**
   * Get all performance statistics
   */
  getAllStats(timeWindow: number = 24 * 60 * 60 * 1000): any {
    try {
      const stats: any = {};
      
      for (const [operation] of this.metrics) {
        stats[operation] = this.getOperationStats(operation, timeWindow);
      }

      return stats;
    } catch (error) {
      console.error('Error getting all stats:', error);
      return {};
    }
  }

  /**
   * Analyze search performance patterns
   */
  analyzeSearchPatterns(): any {
    try {
      const searchMetrics = this.metrics.get('hybrid_search') || [];
      const keywordMetrics = this.metrics.get('keyword_search') || [];
      const vectorMetrics = this.metrics.get('vector_search') || [];

      const analysis = {
        totalSearches: searchMetrics.length,
        avgSearchDuration: 0,
        searchTrends: this.calculateTrends(searchMetrics),
        componentPerformance: {
          keyword: this.getOperationStats('keyword_search'),
          vector: this.getOperationStats('vector_search'),
        },
        recommendations: this.generateRecommendations(searchMetrics, keywordMetrics, vectorMetrics),
      };

      if (searchMetrics.length > 0) {
        const durations = searchMetrics.map(m => m.duration);
        analysis.avgSearchDuration = Math.round(
          durations.reduce((sum, d) => sum + d, 0) / durations.length
        );
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing search patterns:', error);
      return {};
    }
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(metrics: any[]): any {
    try {
      if (metrics.length < 2) return {};

      const recentMetrics = metrics.slice(-50); // Last 50 metrics
      const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2));
      const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2));

      const firstAvg = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length;

      const trend = secondAvg > firstAvg ? 'increasing' : 'decreasing';
      const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

      return {
        trend,
        changePercent: Math.round(changePercent * 100) / 100,
        recentAvg: Math.round(secondAvg),
        previousAvg: Math.round(firstAvg),
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {};
    }
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    searchMetrics: any[],
    keywordMetrics: any[],
    vectorMetrics: any[]
  ): string[] {
    const recommendations: string[] = [];

    try {
      // Analyze average search duration
      if (searchMetrics.length > 0) {
        const avgSearchDuration = searchMetrics.reduce((sum, m) => sum + m.duration, 0) / searchMetrics.length;
        
        if (avgSearchDuration > 500) {
          recommendations.push('검색 응답 시간이 느립니다. 캐싱을 활성화하거나 인덱스를 최적화하세요.');
        }
      }

      // Analyze component performance
      const keywordStats = this.getOperationStats('keyword_search');
      const vectorStats = this.getOperationStats('vector_search');

      if (keywordStats.avgDuration > 200) {
        recommendations.push('키워드 검색 성능이 느립니다. 텍스트 인덱스를 최적화하세요.');
      }

      if (vectorStats.avgDuration > 300) {
        recommendations.push('벡터 검색 성능이 느립니다. 벡터 인덱스를 최적화하거나 임베딩 생성 속도를 개선하세요.');
      }

      // Analyze error rates
      const errorMetrics = searchMetrics.filter(m => m.metadata?.error);
      const errorRate = (errorMetrics.length / searchMetrics.length) * 100;

      if (errorRate > 5) {
        recommendations.push('검색 오류율이 높습니다. 에러 처리와 폴백 메커니즘을 개선하세요.');
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['성능 분석 중 오류가 발생했습니다.'];
    }
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    try {
      const now = Date.now();
      
      for (const [operation, metrics] of this.metrics) {
        const filteredMetrics = metrics.filter(metric => now - metric.timestamp < maxAge);
        this.metrics.set(operation, filteredMetrics);
      }

      loggingService.info('Old metrics cleared', { maxAge: `${maxAge / (24 * 60 * 60 * 1000)}d` });
    } catch (error) {
      console.error('Error clearing old metrics:', error);
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): any {
    try {
      const exportData: any = {};
      
      for (const [operation, metrics] of this.metrics) {
        exportData[operation] = metrics;
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting metrics:', error);
      return {};
    }
  }
}

// Singleton instance
export const performanceMonitorService = new PerformanceMonitorService(); 