from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PropertyData(BaseModel):
    address: str
    floors: int
    market_rent: float
    current_rent: float
    building_class: str
    associates: List[str]
    sub_market: str
    net_floor_area: float
    gross_floor_area: float
    total_comments: int
    total_income: float
    total_expenses: float
    noi: float  # Net Operating Income
    occupancy_rate: float

class PropertyStats(BaseModel):
    total_properties: int
    total_revenue: float
    average_rent: float
    total_square_feet: float
    average_occupancy: float
    total_noi: float

class AssociatePerformance(BaseModel):
    name: str
    total_properties: int
    total_revenue: float
    average_rent: float

class DashboardAnalytics(BaseModel):
    property_stats: PropertyStats
    top_associates: List[AssociatePerformance]
    recent_properties: List[PropertyData]
    market_trends: dict
    building_class_distribution: dict
    sub_market_performance: dict
