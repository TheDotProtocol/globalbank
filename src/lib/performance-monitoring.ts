interface PerformanceMetric {
  id: string;
  type: 'api' | 'database' | 'frontend' | 'system';
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface Alert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'availability';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: Alert[] = [];
  private thresholds = {
    apiResponseTime: { warning: 500, critical: 2000 },
    databaseQueryTime: { warning: 100, critical: 500 },
    memoryUsage: { warning: 80, critical: 95 },
    cpuUsage: { warning: 70, critical: 90 },
    errorRate: { warning: 5, critical: 10 }
  };

  // API Performance Monitoring
  async monitorAPIPerformance(endpoint: string, startTime: number): Promise<void> {
    const responseTime = Date.now() - startTime;
    
    const metric: PerformanceMetric = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'api',
      name: 'response_time',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      severity: this.getSeverity(responseTime, this.thresholds.apiResponseTime),
      metadata: { endpoint }
    };

    this.metrics.push(metric);

    // Check for alerts
    if (responseTime > this.thresholds.apiResponseTime.critical) {
      this.createAlert({
        type: 'performance',
        title: 'Critical API Response Time',
        message: `${endpoint} is responding in ${responseTime}ms`,
        severity: 'critical',
        metadata: { endpoint, responseTime }
      });
    }
  }

  // Database Performance Monitoring
  async monitorDatabasePerformance(query: string, executionTime: number): Promise<void> {
    const metric: PerformanceMetric = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'database',
      name: 'query_execution_time',
      value: executionTime,
      unit: 'ms',
      timestamp: new Date(),
      severity: this.getSeverity(executionTime, this.thresholds.databaseQueryTime),
      metadata: { query: query.substring(0, 100) }
    };

    this.metrics.push(metric);

    if (executionTime > this.thresholds.databaseQueryTime.critical) {
      this.createAlert({
        type: 'performance',
        title: 'Critical Database Query Time',
        message: `Query taking ${executionTime}ms to execute`,
        severity: 'critical',
        metadata: { query: query.substring(0, 100), executionTime }
      });
    }
  }

  // System Resource Monitoring
  async monitorSystemResources(): Promise<void> {
    // Memory usage monitoring
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    const memoryMetric: PerformanceMetric = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'system',
      name: 'memory_usage',
      value: memoryPercent,
      unit: '%',
      timestamp: new Date(),
      severity: this.getSeverity(memoryPercent, this.thresholds.memoryUsage),
      metadata: { 
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      }
    };

    this.metrics.push(memoryMetric);

    if (memoryPercent > this.thresholds.memoryUsage.critical) {
      this.createAlert({
        type: 'performance',
        title: 'Critical Memory Usage',
        message: `Memory usage is at ${memoryPercent.toFixed(2)}%`,
        severity: 'critical',
        metadata: { memoryPercent }
      });
    }

    // CPU usage monitoring (simulated)
    const cpuUsage = this.getCPUUsage();
    const cpuMetric: PerformanceMetric = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'system',
      name: 'cpu_usage',
      value: cpuUsage,
      unit: '%',
      timestamp: new Date(),
      severity: this.getSeverity(cpuUsage, this.thresholds.cpuUsage),
      metadata: { processId: process.pid }
    };

    this.metrics.push(cpuMetric);

    if (cpuUsage > this.thresholds.cpuUsage.critical) {
      this.createAlert({
        type: 'performance',
        title: 'Critical CPU Usage',
        message: `CPU usage is at ${cpuUsage.toFixed(2)}%`,
        severity: 'critical',
        metadata: { cpuUsage }
      });
    }
  }

  // Error Rate Monitoring
  async monitorErrorRate(endpoint: string, isError: boolean): Promise<void> {
    const recentRequests = this.metrics.filter(m => 
      m.type === 'api' && 
      m.metadata?.endpoint === endpoint &&
      m.timestamp > new Date(Date.now() - 60000) // Last minute
    );

    const errorCount = recentRequests.filter(m => m.metadata?.isError).length;
    const totalCount = recentRequests.length;
    const errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0;

    if (errorRate > this.thresholds.errorRate.critical) {
      this.createAlert({
        type: 'error',
        title: 'Critical Error Rate',
        message: `${endpoint} has ${errorRate.toFixed(2)}% error rate`,
        severity: 'critical',
        metadata: { endpoint, errorRate, errorCount, totalCount }
      });
    }
  }

  // Frontend Performance Monitoring
  async monitorFrontendPerformance(metric: {
    name: string;
    value: number;
    unit: string;
    metadata?: any;
  }): Promise<void> {
    const frontendMetric: PerformanceMetric = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'frontend',
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      timestamp: new Date(),
      severity: 'low', // Frontend metrics are typically informational
      metadata: metric.metadata
    };

    this.metrics.push(frontendMetric);

    // Check for critical frontend issues
    if (metric.name === 'page_load_time' && metric.value > 5000) {
      this.createAlert({
        type: 'performance',
        title: 'Slow Page Load',
        message: `Page load time is ${metric.value}ms`,
        severity: 'high',
        metadata: { pageLoadTime: metric.value }
      });
    }
  }

  // Performance Analytics
  getPerformanceAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
    mostErrors: Array<{ endpoint: string; errorCount: number }>;
  } {
    const now = new Date();
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const recentMetrics = this.metrics.filter(m => 
      m.timestamp > new Date(now.getTime() - timeRangeMs[timeRange])
    );

    const apiMetrics = recentMetrics.filter(m => m.type === 'api');
    const averageResponseTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;

    const errorMetrics = recentMetrics.filter(m => m.metadata?.isError);
    const errorRate = recentMetrics.length > 0 
      ? (errorMetrics.length / recentMetrics.length) * 100 
      : 0;

    const throughput = recentMetrics.length / (timeRangeMs[timeRange] / 1000);

    // Slowest endpoints
    const endpointGroups = apiMetrics.reduce((groups, metric) => {
      const endpoint = metric.metadata?.endpoint || 'unknown';
      if (!groups[endpoint]) groups[endpoint] = [];
      groups[endpoint].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);

    const slowestEndpoints = Object.entries(endpointGroups)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgTime: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    // Most errors
    const errorGroups = errorMetrics.reduce((groups, metric) => {
      const endpoint = metric.metadata?.endpoint || 'unknown';
      groups[endpoint] = (groups[endpoint] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);

    const mostErrors = Object.entries(errorGroups)
      .map(([endpoint, count]) => ({ endpoint, errorCount: count }))
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5);

    return {
      averageResponseTime,
      errorRate,
      throughput,
      slowestEndpoints,
      mostErrors
    };
  }

  // Performance Optimization Recommendations
  getOptimizationRecommendations(): Array<{
    type: 'database' | 'api' | 'frontend' | 'system';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
  }> {
    const recommendations: Array<{
      type: 'database' | 'api' | 'frontend' | 'system';
      priority: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      impact: string;
    }> = [];

    const analytics = this.getPerformanceAnalytics('24h');

    // Database recommendations
    if (analytics.averageResponseTime > 1000) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        title: 'Optimize Database Queries',
        description: 'Consider adding database indexes and optimizing slow queries',
        impact: 'High - Will reduce response times by 50-80%'
      });
    }

    // API recommendations
    if (analytics.errorRate > 5) {
      recommendations.push({
        type: 'api',
        priority: 'critical',
        title: 'Fix High Error Rate',
        description: 'Investigate and fix the high error rate in API endpoints',
        impact: 'Critical - Affects user experience and system reliability'
      });
    }

    // System recommendations
    const systemMetrics = this.metrics.filter(m => m.type === 'system');
    const avgMemoryUsage = systemMetrics
      .filter(m => m.name === 'memory_usage')
      .reduce((sum, m) => sum + m.value, 0) / systemMetrics.length;

    if (avgMemoryUsage > 80) {
      recommendations.push({
        type: 'system',
        priority: 'high',
        title: 'Optimize Memory Usage',
        description: 'Consider implementing memory optimization and garbage collection tuning',
        impact: 'High - Will improve system stability and performance'
      });
    }

    return recommendations;
  }

  // Alert Management
  private createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(newAlert);

    // In production, this would trigger notifications
    console.log(`🚨 ALERT: ${alert.title} - ${alert.message}`);
  }

  private getSeverity(value: number, threshold: { warning: number; critical: number }): 'low' | 'medium' | 'high' | 'critical' {
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'high';
    return 'low';
  }

  private getCPUUsage(): number {
    // In production, this would use actual CPU monitoring
    return Math.random() * 30 + 20; // Simulated 20-50% usage
  }

  // Get metrics for admin dashboard
  getMetrics(type?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get alerts for admin dashboard
  getAlerts(resolved?: boolean): Alert[] {
    let filtered = this.alerts;
    if (resolved !== undefined) {
      filtered = filtered.filter(a => a.resolved === resolved);
    }
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Clear old metrics (cleanup)
  cleanupOldMetrics(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffDate);
  }
}

export const performanceMonitor = new PerformanceMonitor(); 