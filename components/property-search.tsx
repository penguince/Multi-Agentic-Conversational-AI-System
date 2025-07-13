"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, DollarSign, Home, Users } from "lucide-react";

interface PropertyResult {
  property: {
    id: number;
    address: string;
    floor: string;
    suite: string;
    size_sf: number;
    rent_per_sf_year: number;
    annual_rent: number;
    monthly_rent: number;
    gci_3_years: number;
    associates: string[];
    broker_email: string;
    formatted_info: string;
  };
  match_score: number;
  match_reasons: string[];
}

export function PropertySearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);

  const searchProperties = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results || []);
        setTotalFound(data.total_found || 0);
      } else {
        console.error('Search failed:', data);
        setResults([]);
        setTotalFound(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalFound(0);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchProperties();
    }
  };

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
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Property Search
          </CardTitle>
          <CardDescription>
            Search our commercial real estate portfolio by address, associate, rent range, or features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., 'Broadway', 'Jack Sparrow', 'high rent luxury', 'large office space'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchProperties} disabled={loading || !query.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          
          {/* Quick Search Examples */}
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Try these searches:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Broadway properties",
                "Jack Sparrow",
                "luxury high rent",
                "large office space",
                "Fifth Avenue",
                "affordable properties"
              ].map((example) => (
                <Badge
                  key={example}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setQuery(example);
                    // Auto-search on click
                    setTimeout(() => {
                      const input = document.querySelector('input[placeholder*="Broadway"]') as HTMLInputElement;
                      if (input) {
                        input.value = example;
                        searchProperties();
                      }
                    }, 100);
                  }}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({totalFound} found)
            </h3>
            <Badge variant="outline">Query: "{query}"</Badge>
          </div>

          {results.map((result, index) => (
            <Card key={result.property.id || index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {result.property.address}
                    </h4>
                    <p className="text-muted-foreground">
                      Floor: {result.property.floor} • Suite: {result.property.suite}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Match Score: {result.match_score}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-semibold">{formatNumber(result.property.size_sf)} sq ft</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Rent</p>
                      <p className="font-semibold">{formatCurrency(result.property.annual_rent)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Associates</p>
                      <p className="font-semibold">{result.property.associates.length}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Financial Details:</p>
                    <p className="text-sm text-muted-foreground">
                      Monthly: {formatCurrency(result.property.monthly_rent)} • 
                      Per sq ft: ${result.property.rent_per_sf_year}/year • 
                      3-Year GCI: {formatCurrency(result.property.gci_3_years)}
                    </p>
                  </div>

                  {result.property.associates.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Associates:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.property.associates.map((associate) => (
                          <Badge key={associate} variant="outline" className="text-xs">
                            {associate}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.match_reasons.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Why this matches:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {result.match_reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No properties found matching "{query}". Try different keywords or broader terms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
