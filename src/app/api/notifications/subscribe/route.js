import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { User } from '../../../../../lib/models';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { subscription } = await req.json();
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription data is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Update user with push subscription
    await User.findOneAndUpdate(
      { email: session.user.email },
      { pushSubscription: subscription },
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Push notification subscription saved'
    });
    
  } catch (error) {
    console.error('Subscribe notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Remove push subscription from user
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $unset: { pushSubscription: 1 } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Push notification subscription removed'
    });
    
  } catch (error) {
    console.error('Unsubscribe notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}