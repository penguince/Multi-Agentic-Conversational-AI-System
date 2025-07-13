from fastapi import APIRouter, HTTPException, Query
from .service import PropertyAnalytics
from .property_search import PropertySearchService
from .models import DashboardAnalytics, PropertyStats, PropertyData
from typing import List

router = APIRouter()

@router.get("/dashboard", response_model=DashboardAnalytics)
async def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    try:
        analytics_service = PropertyAnalytics()
        return analytics_service.get_dashboard_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard analytics: {str(e)}")

@router.get("/properties/stats", response_model=PropertyStats)
async def get_property_stats():
    """Get overall property statistics"""
    try:
        analytics_service = PropertyAnalytics()
        return analytics_service.get_property_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch property stats: {str(e)}")

@router.get("/properties")
async def get_properties(limit: int = 25, offset: int = 0):
    """Get properties data with pagination"""
    try:
        analytics_service = PropertyAnalytics()
        properties = analytics_service.get_recent_properties(limit, offset)
        total_count = analytics_service.get_total_properties_count()
        
        return {
            "properties": properties,
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "hasMore": offset + limit < total_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch properties: {str(e)}")

@router.get("/market-trends")
async def get_market_trends():
    """Get market trends and insights"""
    try:
        analytics_service = PropertyAnalytics()
        return analytics_service.get_market_trends()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market trends: {str(e)}")

@router.get("/building-class-distribution")
async def get_building_class_distribution():
    """Get distribution of properties by building class"""
    try:
        analytics_service = PropertyAnalytics()
        return analytics_service.get_building_class_distribution()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch building class distribution: {str(e)}")

@router.get("/sub-market-performance")
async def get_sub_market_performance():
    """Get performance metrics by sub-market"""
    try:
        analytics_service = PropertyAnalytics()
        return analytics_service.get_sub_market_performance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sub-market performance: {str(e)}")

@router.post("/refresh")
async def refresh_analytics():
    """Refresh analytics data by reloading the dataset"""
    try:
        analytics_service = PropertyAnalytics()
        search_service = PropertySearchService()
        analytics_service.load_data()
        search_service.analytics.load_data()  # Refresh search service data too
        return {"message": "Analytics data refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh analytics: {str(e)}")

# Property Search Endpoints
@router.get("/search")
async def search_properties(q: str = Query(..., description="Search query for properties"), limit: int = 10):
    """Search properties based on natural language query"""
    try:
        search_service = PropertySearchService()
        results = search_service.search_properties(q, limit)
        return {
            "query": q,
            "results": results,
            "total_found": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search properties: {str(e)}")

@router.get("/property/{address}")
async def get_property_by_address(address: str):
    """Get specific property by address"""
    try:
        search_service = PropertySearchService()
        property_data = search_service.get_property_by_address(address)
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        return property_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get property: {str(e)}")

@router.get("/associate/{associate_name}")
async def get_properties_by_associate(associate_name: str):
    """Get properties handled by a specific associate"""
    try:
        search_service = PropertySearchService()
        properties = search_service.get_properties_by_associate(associate_name)
        return {
            "associate": associate_name,
            "properties": properties,
            "total_properties": len(properties)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get properties by associate: {str(e)}")

@router.get("/price-range")
async def get_properties_in_price_range(
    min_rent: float = Query(..., description="Minimum annual rent"),
    max_rent: float = Query(..., description="Maximum annual rent")
):
    """Get properties within a specific rent range"""
    try:
        search_service = PropertySearchService()
        properties = search_service.get_properties_in_price_range(min_rent, max_rent)
        return {
            "price_range": {"min": min_rent, "max": max_rent},
            "properties": properties,
            "total_properties": len(properties)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get properties in price range: {str(e)}")

@router.get("/market-summary")
async def get_market_summary(area: str = Query(None, description="Market area to analyze")):
    """Get market summary for a specific area or overall"""
    try:
        search_service = PropertySearchService()
        summary = search_service.get_market_summary(area)
        return {
            "market_area": area or "Overall Market",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market summary: {str(e)}")

@router.get("/debug")
async def debug_data():
    """Debug endpoint to check data loading"""
    try:
        df = analytics_service.df
        return {
            "data_loaded": not df.empty,
            "row_count": len(df),
            "columns": list(df.columns) if not df.empty else [],
            "first_few_rows": df.head(3).to_dict('records') if not df.empty else [],
            "data_path": analytics_service.data_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug failed: {str(e)}")
