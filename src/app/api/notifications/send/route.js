import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { User } from '../../../../../lib/models';

// Configure VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    const { title, message, url } = await req.json();
    
    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Title and message are required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get all users who have push notification subscriptions
    const usersWithSubscriptions = await User.find({
      pushSubscription: { $exists: true, $ne: null }
    });
    
    if (usersWithSubscriptions.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No users subscribed to notifications', sent: 0 },
        { status: 200 }
      );
    }
    
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/logo.png',
      badge: '/logo.png',
      url: url || '/',
      timestamp: Date.now()
    });
    
    const promises = usersWithSubscriptions.map(async (user) => {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        return { success: true, userId: user._id };
      } catch (error) {
        console.error(`Failed to send notification to user ${user._id}:`, error);
        
        // If the subscription is invalid, remove it from the user
        if (error.statusCode === 410 || error.statusCode === 404) {
          await User.findByIdAndUpdate(user._id, {
            $unset: { pushSubscription: 1 }
          });
        }
        
        return { success: false, userId: user._id, error: error.message };
      }
    });
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Notifications sent successfully`,
      sent: successful,
      failed: failed,
      total: usersWithSubscriptions.length
    });
    
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}