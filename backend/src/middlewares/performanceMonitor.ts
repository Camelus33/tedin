import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  timestamp: Date;
  memoryUsage: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000; // 최대 저장 메트릭 수

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 성능 모니터링 미들웨어
   */
  public monitor() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      // 응답 완료 후 메트릭 수집
      res.on('finish', () => {
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        
        const metric: PerformanceMetrics = {
          endpoint: req.path,
          method: req.method,
          responseTime: endTime - startTime,
          timestamp: new Date(),
          memoryUsage: endMemory - startMemory
        };

        this.addMetric(metric);
      });

      next();
    };
  }

  /**
   * 메트릭 추가
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // 최대 개수 초과 시 오래된 메트릭 제거
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * 성능 통계 조회
   */
  public getPerformanceStats(): {
    totalRequests: number;
    averageResponseTime: number;
    averageMemoryUsage: number;
    slowestEndpoints: Array<{ endpoint: string; avgResponseTime: number }>;
    memoryIntensiveEndpoints: Array<{ endpoint: string; avgMemoryUsage: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        averageMemoryUsage: 0,
        slowestEndpoints: [],
        memoryIntensiveEndpoints: []
      };
    }

    const totalRequests = this.metrics.length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const averageMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / totalRequests;

    // 엔드포인트별 평균 응답 시간
    const endpointStats = new Map<string, { totalTime: number; count: number }>();
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || { totalTime: 0, count: 0 };
      existing.totalTime += metric.responseTime;
      existing.count += 1;
      endpointStats.set(key, existing);
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgResponseTime: stats.totalTime / stats.count
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 5);

    // 엔드포인트별 평균 메모리 사용량
    const memoryStats = new Map<string, { totalMemory: number; count: number }>();
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = memoryStats.get(key) || { totalMemory: 0, count: 0 };
      existing.totalMemory += metric.memoryUsage;
      existing.count += 1;
      memoryStats.set(key, existing);
    });

    const memoryIntensiveEndpoints = Array.from(memoryStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgMemoryUsage: stats.totalMemory / stats.count
      }))
      .sort((a, b) => b.avgMemoryUsage - a.avgMemoryUsage)
      .slice(0, 5);

    return {
      totalRequests,
      averageResponseTime,
      averageMemoryUsage,
      slowestEndpoints,
      memoryIntensiveEndpoints
    };
  }

  /**
   * 메트릭 초기화
   */
  public clearMetrics(): void {
    this.metrics = [];
  }
}

export default PerformanceMonitor; 