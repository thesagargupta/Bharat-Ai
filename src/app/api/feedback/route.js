import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

// POST - Submit feedback
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, category, message } = await request.json();

    // Validate input
    if (!name || !email || !category || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Create email transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.FEEDBACK_EMAIL || 'sagarkshn8@gmail.com',
      subject: `Bharat AI Feedback - ${category}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #f97316; margin-bottom: 20px; border-bottom: 3px solid #f97316; padding-bottom: 10px;">
              New Feedback from Bharat AI
            </h2>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
              <strong style="color: #92400e;">Category:</strong> 
              <span style="color: #78350f; text-transform: capitalize;">${category}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">From:</strong> 
              <span style="color: #6b7280;">${name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">Email:</strong> 
              <span style="color: #6b7280;">${email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">User Account:</strong> 
              <span style="color: #6b7280;">${session.user.email}</span>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <strong style="color: #374151; display: block; margin-bottom: 10px;">Message:</strong>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; color: #1f2937; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>This feedback was submitted via Bharat AI Settings</p>
              <p>Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent successfully' 
    });

  } catch (error) {
    console.error('Error sending feedback:', error);
    return NextResponse.json({ 
      error: 'Failed to send feedback. Please try again later.',
      details: error.message 
    }, { status: 500 });
  }
}
