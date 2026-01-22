import { NextRequest, NextResponse } from 'next/server';

// In production, use a proper database to store subscriptions
// This is a simplified in-memory storage for demonstration
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the subscription data
    if (!body.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Store the subscription (use endpoint as key)
    const endpoint = body.endpoint;
    subscriptions.set(endpoint, {
      ...body,
      createdAt: new Date().toISOString(),
    });

    console.log(`Push subscription saved: ${endpoint.substring(0, 50)}...`);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved' 
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

// Endpoint to send notifications (would be called from your backend)
export async function GET() {
  // Return all subscriptions (for admin use)
  // In production, this should be protected
  const allSubscriptions = Array.from(subscriptions.values());
  
  return NextResponse.json({ 
    count: allSubscriptions.length,
    subscriptions: allSubscriptions 
  });
}

