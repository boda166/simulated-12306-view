import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info, Zap, Monitor, Smartphone, Battery, Wifi } from 'lucide-react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface PerformanceDashboardProps {
  componentName: string;
  showDetailed?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  componentName, 
  showDetailed = false 
}) => {
  const { metrics, resourceTimings, isOptimizedMode, recommendations, refreshMetrics, memoryUsage } = 
    useAdvancedPerformance(componentName);
  const [showFullDetails, setShowFullDetails] = useState(showDetailed);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getScoreColor = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return 'text-green-600';
    if (score <= thresholds.needs) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (!metrics && !showFullDetails) return null;

  return (
    <div className="space-y-4">
      {/* Quick Performance Summary */}
      {metrics && (
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Performance Status
              </CardTitle>
              <div className="flex items-center gap-2">
                {isOptimizedMode && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Optimized
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={refreshMetrics}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device & Connection Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                {getDeviceIcon(metrics.deviceType)}
                <div>
                  <p className="text-sm font-medium capitalize">{metrics.deviceType}</p>
                  <p className="text-xs text-muted-foreground">Device</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Wifi className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{metrics.connectionType}</p>
                  <p className="text-xs text-muted-foreground">Connection</p>
                </div>
              </div>
              
              {metrics.batteryLevel && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Battery className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(metrics.batteryLevel)}%</p>
                    <p className="text-xs text-muted-foreground">Battery</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Monitor className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{formatBytes(metrics.memoryUsage)}</p>
                  <p className="text-xs text-muted-foreground">Memory</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Load Time</span>
                  <span className={`text-sm ${getScoreColor(metrics.loadTime, { good: 1500, needs: 3000 })}`}>
                    {formatTime(metrics.loadTime)}
                  </span>
                </div>
                <Progress 
                  value={Math.min((metrics.loadTime / 5000) * 100, 100)} 
                  className="h-2"
                />
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Render Time</span>
                  <span className={`text-sm ${getScoreColor(metrics.renderTime, { good: 100, needs: 300 })}`}>
                    {formatTime(metrics.renderTime)}
                  </span>
                </div>
                <Progress 
                  value={Math.min((metrics.renderTime / 500) * 100, 100)} 
                  className="h-2"
                />
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Interaction</span>
                  <span className={`text-sm ${getScoreColor(metrics.interactionTime, { good: 100, needs: 300 })}`}>
                    {formatTime(metrics.interactionTime)}
                  </span>
                </div>
                <Progress 
                  value={Math.min((metrics.interactionTime / 500) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </h4>
                <div className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Performance Dashboard */}
      {showFullDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Performance Analysis</CardTitle>
            <CardDescription>
              Comprehensive performance metrics and resource analysis for {componentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="memory">Memory</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Device Performance</span>
                          {metrics.isLowEndDevice ? (
                            <Badge variant="outline" className="text-orange-600">
                              Low-end Device
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">
                              High-end Device
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Optimization Mode</span>
                          {isOptimizedMode ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Resource Loading Performance</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {resourceTimings.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {resource.name.split('/').pop() || resource.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(resource.transferSize)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">{formatTime(resource.duration)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="memory" className="space-y-4">
                {memoryUsage && (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="text-sm font-medium mb-3">Memory Usage</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Used Memory</span>
                              <span>{formatBytes(memoryUsage.used)}</span>
                            </div>
                            <Progress 
                              value={(memoryUsage.used / memoryUsage.limit) * 100} 
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Total Allocated</span>
                              <span>{formatBytes(memoryUsage.total)}</span>
                            </div>
                            <Progress 
                              value={(memoryUsage.total / memoryUsage.limit) * 100} 
                              className="h-2"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Limit: {formatBytes(memoryUsage.limit)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="network" className="space-y-4">
                {metrics && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-3">Network Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Effective Connection Type</span>
                          <Badge variant="outline">{metrics.connectionType}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Device Type</span>
                          <Badge variant="outline" className="capitalize">{metrics.deviceType}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!showFullDetails && (
        <Button 
          variant="outline" 
          onClick={() => setShowFullDetails(true)}
          className="w-full"
        >
          Show Detailed Performance Analysis
        </Button>
      )}
    </div>
  );
};

export default PerformanceDashboard;