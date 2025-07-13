"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { usePropertyData } from "@/hooks/use-dashboard-data";
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  Users,
  Search,
  Filter,
  Loader2
} from "lucide-react";

interface Property {
  address: string;
  floors: number;
  market_rent: number;
  current_rent: number;
  building_class: string;
  associates: string[];
  sub_market: string;
  net_floor_area: number;
  gross_floor_area: number;
  total_comments: number;
  total_income: number;
  total_expenses: number;
  noi: number;
  occupancy_rate: number;
}

export function PropertyList() {
  const { 
    properties, 
    loading, 
    error, 
    hasMore, 
    totalCount, 
    loadMore, 
    refreshProperties 
  } = usePropertyData(25);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter properties based on search term with memoization
  const filteredProperties = useMemo(() => {
    if (!searchTerm) {
      return properties;
    }
    return properties.filter(property =>
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.sub_market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.building_class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.associates.some(associate => 
        associate.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [properties, searchTerm]);

  // Remove the useEffect that was setting filteredProperties state

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

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Properties</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshProperties} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Property Portfolio</h2>
          <p className="text-muted-foreground">
            Browse and manage your commercial real estate properties
          </p>
        </div>
        
        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search properties, markets, or associates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Showing {filteredProperties.length} of {totalCount} properties
          </div>
        </div>
      </div>

      {/* Property Grid */}
      {loading && properties.length === 0 ? (
        <PropertyListSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property, index) => (
            <PropertyCard key={`${property.address}-${index}`} property={property} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !searchTerm && (
        <div className="flex justify-center">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More Properties (${totalCount - properties.length} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* No Results */}
      {searchTerm && filteredProperties.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground text-center">
              No properties match your search for "{searchTerm}". Try adjusting your search terms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1">{property.address}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          {property.sub_market}
          <Badge variant="outline" className="text-xs">
            {property.building_class}
          </Badge>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Annual Income</div>
            <div className="font-semibold">{formatCurrency(property.total_income)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Monthly Rent</div>
            <div className="font-semibold">{formatCurrency(property.current_rent)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Size</div>
            <div className="font-semibold">{formatNumber(property.gross_floor_area)} sq ft</div>
          </div>
          <div>
            <div className="text-muted-foreground">Floors</div>
            <div className="font-semibold">{property.floors}</div>
          </div>
        </div>

        {/* NOI and Occupancy */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">NOI: </span>
            <span className="font-semibold">{formatCurrency(property.noi)}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Occupancy: </span>
            <span className="font-semibold">{property.occupancy_rate}%</span>
          </div>
        </div>

        {/* Associates */}
        {property.associates && property.associates.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="h-3 w-3" />
              Associates
            </div>
            <div className="flex flex-wrap gap-1">
              {property.associates.slice(0, 2).map((associate, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {associate}
                </Badge>
              ))}
              {property.associates.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.associates.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PropertyListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
