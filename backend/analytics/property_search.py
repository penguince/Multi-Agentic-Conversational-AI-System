import pandas as pd
import os
from typing import List, Dict, Any, Optional
from analytics.service import PropertyAnalytics

class PropertySearchService:
    def __init__(self):
        self.analytics = PropertyAnalytics()
        
    def search_properties(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search properties based on natural language query"""
        if self.analytics.df.empty:
            return []
        
        query_lower = query.lower()
        results = []
        
        # Search in multiple fields - using correct column names from CSV
        search_fields = ['Address', 'Associate']
        
        for _, row in self.analytics.df.iterrows():
            match_score = 0
            match_reasons = []
            
            # Address matching
            if 'Address' in row and pd.notna(row['Address']):
                address = str(row['Address']).lower()
                if any(term in address for term in query_lower.split()):
                    match_score += 3
                    match_reasons.append(f"Address match: {row['Address']}")
            
            # Associate matching
            if 'Associate' in row and pd.notna(row['Associate']):
                associate = str(row['Associate']).lower()
                if any(term in associate for term in query_lower.split()):
                    match_score += 2
                    match_reasons.append(f"Associate match: {row['Associate']}")
            
            # Rent range matching
            if any(term in query_lower for term in ['expensive', 'high rent', 'luxury', 'premium']):
                if row['Annual Rent'] > 1500000:  # High-end properties
                    match_score += 2
                    match_reasons.append("High-end property")
            
            if any(term in query_lower for term in ['affordable', 'cheap', 'low rent', 'budget']):
                if row['Annual Rent'] < 1000000:  # Budget properties
                    match_score += 2
                    match_reasons.append("Budget-friendly property")
            
            # Size matching
            if any(term in query_lower for term in ['large', 'big', 'spacious']):
                if row['Size (SF)'] > 15000:
                    match_score += 1
                    match_reasons.append("Large property")
            
            if any(term in query_lower for term in ['small', 'compact', 'cozy']):
                if row['Size (SF)'] < 12000:
                    match_score += 1
                    match_reasons.append("Compact property")
            
            # Floor/Building type matching
            if 'floor' in query_lower or 'level' in query_lower:
                if pd.notna(row['Floor']):
                    match_score += 1
                    match_reasons.append(f"Floor information: {row['Floor']}")
            
            if match_score > 0:
                results.append({
                    'property': self._format_property(row),
                    'match_score': match_score,
                    'match_reasons': match_reasons
                })
        
        # Sort by match score and return top results
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:limit]
    
    def get_property_by_address(self, address: str) -> Optional[Dict[str, Any]]:
        """Get specific property by address"""
        if self.analytics.df.empty:
            return None
        
        for _, row in self.analytics.df.iterrows():
            if (pd.notna(row.get('Address', '')) and 
                address.lower() in str(row['Address']).lower()):
                return self._format_property(row)
        return None
    
    def get_properties_by_associate(self, associate_name: str) -> List[Dict[str, Any]]:
        """Get properties handled by a specific associate"""
        if self.analytics.df.empty:
            return []
        
        results = []
        associate_lower = associate_name.lower()
        
        for _, row in self.analytics.df.iterrows():
            if ('Associate' in row and pd.notna(row['Associate']) and 
                associate_lower in str(row['Associate']).lower()):
                results.append(self._format_property(row))
        
        return results
    
    def get_properties_in_price_range(self, min_rent: float, max_rent: float) -> List[Dict[str, Any]]:
        """Get properties within a specific rent range"""
        if self.analytics.df.empty:
            return []
        
        filtered_df = self.analytics.df[
            (self.analytics.df['Annual Rent'] >= min_rent) & 
            (self.analytics.df['Annual Rent'] <= max_rent)
        ]
        
        return [self._format_property(row) for _, row in filtered_df.iterrows()]
    
    def get_market_summary(self, market_area: str = None) -> Dict[str, Any]:
        """Get market summary for a specific area or overall"""
        if self.analytics.df.empty:
            return {}
        
        df = self.analytics.df
        
        if market_area:
            # Filter by market area (using street names)
            df = df[df['Address'].str.contains(market_area, case=False, na=False)]
        
        if df.empty:
            return {}
        
        return {
            'total_properties': len(df),
            'average_rent': float(df['Annual Rent'].mean()),
            'median_rent': float(df['Annual Rent'].median()),
            'min_rent': float(df['Annual Rent'].min()),
            'max_rent': float(df['Annual Rent'].max()),
            'average_size': float(df['Size (SF)'].mean()),
            'total_square_footage': float(df['Size (SF)'].sum()),
            'rent_per_sqft': float(df['Rent/SF/Year'].mean()),
            'top_addresses': df.nlargest(5, 'Annual Rent')['Address'].tolist()
        }
    
    def _format_property(self, row) -> Dict[str, Any]:
        """Format property data for API response"""
        # Get associate (single column in our CSV)
        associates = []
        if 'Associate' in row and pd.notna(row['Associate']) and str(row['Associate']).strip():
            associates.append(str(row['Associate']).strip())
        
        return {
            'id': int(row.get('unique_id', 0)) if 'unique_id' in row else 0,
            'address': str(row.get('Address', 'N/A')),
            'floor': str(row.get('Floor', 'N/A')),
            'suite': str(row.get('Suite', 'N/A')),
            'size_sf': int(row.get('Size (SF)', 0)),
            'rent_per_sf_year': float(row.get('Rent/SF/Year', 0)),
            'annual_rent': float(row.get('Annual Rent', 0)),
            'monthly_rent': float(row.get('Monthly Rent', 0)),
            'gci_3_years': float(row.get('GCI On 3 Years', 0)),
            'associates': associates,
            'broker_email': str(row.get('BROKER Email ID', 'N/A')) if 'BROKER Email ID' in row else 'N/A',
            'building_class': str(row.get('Building Class', 'N/A')),
            'formatted_info': self._create_property_summary(row, associates)
        }
    
    def _create_property_summary(self, row, associates: List[str]) -> str:
        """Create a formatted summary of the property for AI context"""
        summary_parts = []
        
        # Basic info
        summary_parts.append(f"Property: {row.get('Address', 'N/A')}")
        summary_parts.append(f"Floor/Suite: {row.get('Floor', 'N/A')}/{row.get('Suite', 'N/A')}")
        summary_parts.append(f"Size: {int(row.get('Size (SF)', 0)):,} sq ft")
        
        # Financial info
        annual_rent = row.get('Annual Rent', 0)
        monthly_rent = row.get('Monthly Rent', 0)
        rent_per_sf = row.get('Rent/SF/Year', 0)
        
        summary_parts.append(f"Annual Rent: ${annual_rent:,.0f}")
        summary_parts.append(f"Monthly Rent: ${monthly_rent:,.0f}")
        summary_parts.append(f"Rent per sq ft: ${rent_per_sf:.2f}/year")
        
        # Associates
        if associates:
            summary_parts.append(f"Associates: {', '.join(associates)}")
        
        # Building class
        if 'Building Class' in row and pd.notna(row['Building Class']):
            summary_parts.append(f"Building Class: {row['Building Class']}")
        
        # ROI info
        gci = row.get('GCI On 3 Years', 0)
        if gci > 0:
            summary_parts.append(f"3-Year GCI: ${gci:,.0f}")
        
        return " | ".join(summary_parts)
