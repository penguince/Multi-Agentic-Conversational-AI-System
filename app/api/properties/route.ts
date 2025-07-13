import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '25';
    const offset = searchParams.get('offset') || '0';
    
    const response = await fetch(`${BACKEND_URL}/api/analytics/properties?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // If backend doesn't support pagination yet, simulate it client-side
    if (Array.isArray(data)) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      const paginatedData = data.slice(offsetNum, offsetNum + limitNum);
      
      return NextResponse.json({
        properties: paginatedData,
        total: data.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < data.length
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
