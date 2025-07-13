import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Get conversation sessions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const limit = searchParams.get('limit') || '20';
    const skip = searchParams.get('skip') || '0';

    let endpoint = '';
    if (userId) {
      endpoint = `/api/conversations/users/${userId}/sessions?limit=${limit}&skip=${skip}`;
    } else if (userEmail) {
      endpoint = `/api/conversations/users/email/${userEmail}/sessions?limit=${limit}&skip=${skip}`;
    } else {
      endpoint = `/api/conversations/recent?limit=${limit}`;
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    // Wrap the response in the expected format for the frontend
    return NextResponse.json({ 
      sessions: Array.isArray(data) ? data : data.sessions || [] 
    });
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// Create new conversation session
export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, title } = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/conversations/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId || null,
        user_email: userEmail || null,
        title: title || 'New Conversation'
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Create conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
