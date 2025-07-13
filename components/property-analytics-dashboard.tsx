"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard-data";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Home, 
  BarChart3,
  MapPin,
  Calculator
} from "lucide-react";

export function PropertyAnalyticsDashboard() {
  const { stats, refreshStats } = useDashboardStats();

  if (stats.loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (stats.error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
            <CardDescription>{stats.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={refreshStats}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Property Analytics</h2>
        <p className="text-muted-foreground">
          Real-time insights from your commercial real estate portfolio
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProperties)}</div>
            <p className="text-xs text-muted-foreground">
              Across all markets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Annual income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rent</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageRent)}</div>
            <p className="text-xs text-muted-foreground">
              Per unit/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Square Feet</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalSquareFeet)}</div>
            <p className="text-xs text-muted-foreground">
              Gross floor area
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers and Recent Properties */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Associates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performing Associates
            </CardTitle>
            <CardDescription>Highest revenue contributors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topAssociates?.length > 0 ? (
              stats.topAssociates.slice(0, 5).map((associate, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{associate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {associate.total_properties} {associate.total_properties === 1 ? 'property' : 'properties'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(associate.total_revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      Avg: {formatCurrency(associate.average_rent)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No associate data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent High-Value Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Revenue Properties
            </CardTitle>
            <CardDescription>Highest income generating assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentProperties?.length > 0 ? (
              stats.recentProperties.slice(0, 5).map((property, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{property.address}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {property.sub_market}
                      <Badge variant="outline" className="text-xs">
                        {property.building_class}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {property.floors} floors • {formatNumber(property.gross_floor_area)} sq ft
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold">{formatCurrency(property.total_income)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(property.market_rent)}/mo
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No property data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Actions</CardTitle>
          <CardDescription>Manage your property data and insights</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <button 
            onClick={refreshStats}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <div>
              <div className="font-medium">Refresh Analytics</div>
              <div className="text-sm text-muted-foreground">Update all metrics</div>
            </div>
          </button>
          
          <a 
            href="/dashboard/documents" 
            className="flex items-center justify-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <div>
              <div className="font-medium">View Detailed Reports</div>
              <div className="text-sm text-muted-foreground">Comprehensive analytics</div>
            </div>
          </a>
          
          <a 
            href="/dashboard/chat" 
            className="flex items-center justify-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <Users className="h-4 w-4" />
            <div>
              <div className="font-medium">Chat with AI</div>
              <div className="text-sm text-muted-foreground">Get property insights</div>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between p-3 rounded-lg border">
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
