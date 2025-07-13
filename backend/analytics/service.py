import pandas as pd
import os
from typing import List, Dict, Any
from .models import PropertyData, PropertyStats, AssociatePerformance, DashboardAnalytics

class PropertyAnalytics:
    def __init__(self):
        self.data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'dataset.csv')
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Load and clean the property dataset"""
        try:
            self.df = pd.read_csv(self.data_path)
            self._clean_data()
        except FileNotFoundError:
            print(f"Dataset not found at {self.data_path}")
            self.df = pd.DataFrame()
        except Exception as e:
            print(f"Error loading dataset: {e}")
            self.df = pd.DataFrame()
    
    def _clean_data(self):
        """Clean and prepare the data for analysis"""
        if self.df.empty:
            return
        
        # Clean currency columns (remove $ and commas)
        currency_columns = ['Rent/SF/Year', 'Annual Rent', 'Monthly Rent', 'GCI On 3 Years']
        for col in currency_columns:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(
                    self.df[col].astype(str).str.replace('$', '').str.replace(',', ''), 
                    errors='coerce'
                )
        
        # Clean numeric columns
        if 'Size (SF)' in self.df.columns:
            self.df['Size (SF)'] = pd.to_numeric(self.df['Size (SF)'], errors='coerce')
        
        # Calculate occupancy rate (assuming 100% if rent exists)
        self.df['Occupancy Rate'] = (
            (self.df['Monthly Rent'] > 0).astype(float) * 100
        )
        
        # Fill NaN values
        self.df = self.df.fillna(0)
    
    def get_property_stats(self) -> PropertyStats:
        """Calculate overall property statistics"""
        if self.df.empty:
            return PropertyStats(
                total_properties=0,
                total_revenue=0,
                average_rent=0,
                total_square_feet=0,
                average_occupancy=0,
                total_noi=0
            )
        
        return PropertyStats(
            total_properties=len(self.df),
            total_revenue=self.df['Annual Rent'].sum(),
            average_rent=self.df['Monthly Rent'].mean(),
            total_square_feet=self.df['Size (SF)'].sum(),
            average_occupancy=self.df['Occupancy Rate'].mean(),
            total_noi=self.df['GCI On 3 Years'].sum()
        )
    
    def get_top_associates(self, limit: int = 5) -> List[AssociatePerformance]:
        """Get top performing associates"""
        if self.df.empty:
            return []
        
        # Combine all associate columns
        associate_data = []
        
        for _, row in self.df.iterrows():
            associates = []
            # Get all associate columns
            for col in ['Associate 1', 'Associate 2', 'Associate 3', 'Associate 4']:
                if col in self.df.columns and pd.notna(row[col]) and str(row[col]).strip():
                    associates.append(str(row[col]).strip())
            
            for associate in associates:
                if associate and associate != 'nan':
                    associate_data.append({
                        'name': associate,
                        'revenue': row['Annual Rent'],
                        'rent': row['Monthly Rent'],
                        'properties': 1
                    })
        
        if not associate_data:
            return []
        
        # Aggregate by associate
        associate_df = pd.DataFrame(associate_data)
        grouped = associate_df.groupby('name').agg({
            'properties': 'sum',
            'revenue': 'sum',
            'rent': 'mean'
        }).sort_values('revenue', ascending=False).head(limit)
        
        return [
            AssociatePerformance(
                name=name,
                total_properties=int(row['properties']),
                total_revenue=float(row['revenue']),
                average_rent=float(row['rent'])
            )
            for name, row in grouped.iterrows()
        ]
    
    def get_recent_properties(self, limit: int = 10, offset: int = 0) -> List[PropertyData]:
        """Get recent properties (sorted by highest income) with pagination"""
        if self.df.empty:
            return []
        
        # Sort by annual rent (highest income first)
        sorted_df = self.df.sort_values('Annual Rent', ascending=False)
        
        # Apply pagination
        paginated = sorted_df.iloc[offset:offset + limit]
        
        properties = []
        for _, row in paginated.iterrows():
            associates_list = []
            # Get all associate columns
            for col in ['Associate 1', 'Associate 2', 'Associate 3', 'Associate 4']:
                if col in self.df.columns and pd.notna(row[col]) and str(row[col]).strip():
                    associates_list.append(str(row[col]).strip())
            
            # Get building class from floor info
            building_class = 'Commercial'
            if pd.notna(row.get('Floor', '')):
                floor_str = str(row['Floor'])
                if 'P' in floor_str:
                    building_class = 'Premium'
                elif 'E' in floor_str:
                    building_class = 'Executive'
            
            # Estimate floors from floor data
            floors = 1
            if pd.notna(row.get('Floor', '')):
                floor_str = str(row['Floor'])
                # Extract number from floor string
                import re
                numbers = re.findall(r'\d+', floor_str)
                if numbers:
                    floors = max(1, int(numbers[0]) // 10 + 1)
            
            properties.append(PropertyData(
                address=str(row.get('Property Address', 'N/A')),
                floors=floors,
                market_rent=float(row.get('Rent/SF/Year', 0)),
                current_rent=float(row.get('Monthly Rent', 0)),
                building_class=building_class,
                associates=associates_list,
                sub_market=' '.join(str(row.get('Property Address', 'N/A')).split(' ')[-2:]),  # Convert to string
                net_floor_area=float(row.get('Size (SF)', 0)) * 0.85,  # Estimate net as 85% of gross
                gross_floor_area=float(row.get('Size (SF)', 0)),
                total_comments=0,  # Not available in dataset
                total_income=float(row.get('Annual Rent', 0)),
                total_expenses=float(row.get('Annual Rent', 0)) * 0.3,  # Estimate 30% expenses
                noi=float(row.get('GCI On 3 Years', 0)),
                occupancy_rate=float(row.get('Occupancy Rate', 100))
            ))
        
        return properties

    def get_total_properties_count(self) -> int:
        """Get total count of properties in the dataset"""
        return len(self.df) if not self.df.empty else 0
    
    def get_market_trends(self) -> Dict[str, Any]:
        """Calculate market trends and insights"""
        if self.df.empty:
            return {}
        
        # Extract street names for market analysis
        street_markets = []
        if 'Property Address' in self.df.columns:
            for address in self.df['Property Address']:
                if pd.notna(address):
                    # Extract street name (e.g., "36 W 36th St" -> "36th St")
                    parts = str(address).split()
                    if len(parts) >= 3:
                        street_markets.append(' '.join(parts[-2:]))
        
        trends = {
            'avg_rent_per_sqft': float(self.df['Rent/SF/Year'].mean()) if 'Rent/SF/Year' in self.df.columns else 0,
            'highest_rent_property': str(self.df.loc[self.df['Annual Rent'].idxmax(), 'Property Address']) if not self.df.empty else 'N/A',
            'most_profitable_property': str(self.df.loc[self.df['GCI On 3 Years'].idxmax(), 'Property Address']) if not self.df.empty else 'N/A',
            'total_portfolio_value': float(self.df['Annual Rent'].sum()),
            'average_unit_size': float(self.df['Size (SF)'].mean()),
            'total_units': len(self.df),
        }
        
        return trends
    
    def get_building_class_distribution(self) -> Dict[str, int]:
        """Get distribution of properties by building class"""
        if self.df.empty:
            return {}
        
        # Create building classes based on floor data
        building_classes = []
        for _, row in self.df.iterrows():
            if pd.notna(row.get('Floor', '')):
                floor_str = str(row['Floor'])
                if 'P' in floor_str:
                    building_classes.append('Premium')
                elif 'E' in floor_str:
                    building_classes.append('Executive')
                else:
                    building_classes.append('Standard')
            else:
                building_classes.append('Standard')
        
        self.df['Building_Class'] = building_classes
        return self.df['Building_Class'].value_counts().to_dict()
    
    def get_sub_market_performance(self) -> Dict[str, Dict[str, float]]:
        """Get performance metrics by sub-market"""
        if self.df.empty:
            return {}
        
        # Create sub-markets based on street names
        sub_markets = []
        for _, row in self.df.iterrows():
            if pd.notna(row.get('Property Address', '')):
                address = str(row['Property Address'])
                parts = address.split()
                if len(parts) >= 3:
                    # Use street name as sub-market
                    street = ' '.join(parts[-2:])
                    sub_markets.append(street)
                else:
                    sub_markets.append('Other')
            else:
                sub_markets.append('Other')
        
        self.df['Sub_Market'] = sub_markets
        
        grouped = self.df.groupby('Sub_Market').agg({
            'Annual Rent': 'sum',
            'Monthly Rent': 'mean',
            'GCI On 3 Years': 'sum',
            'Size (SF)': 'sum'
        })
        
        result = {}
        for market, row in grouped.iterrows():
            result[str(market)] = {
                'total_income': float(row['Annual Rent']),
                'average_rent': float(row['Monthly Rent']),
                'total_noi': float(row['GCI On 3 Years']),
                'total_area': float(row['Size (SF)'])
            }
        
        return result
    
    def get_dashboard_analytics(self) -> DashboardAnalytics:
        """Get comprehensive dashboard analytics"""
        return DashboardAnalytics(
            property_stats=self.get_property_stats(),
            top_associates=self.get_top_associates(),
            recent_properties=self.get_recent_properties(),
            market_trends=self.get_market_trends(),
            building_class_distribution=self.get_building_class_distribution(),
            sub_market_performance=self.get_sub_market_performance()
        )
