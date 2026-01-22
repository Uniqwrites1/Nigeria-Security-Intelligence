import { NextRequest, NextResponse } from 'next/server';

// Import the shared subscriptions map
// In production, use a proper database
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Remove the subscription
    const endpoint = body.endpoint;
    subscriptions.delete(endpoint);

    console.log(`Push subscription removed: ${endpoint.substring(0, 50)}...`);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed' 
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

