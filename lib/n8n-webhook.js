// N8N Webhook Service - Replaces Gemini API with lighter webhook-based approach

/**
 * Call n8n webhook to generate AI chat response
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @param {Object} imageData - Optional image data {buffer, mimetype}
 * @returns {Object} - {success, message, usage, errorType}
 */
export const generateChatResponse = async (message, conversationHistory = [], imageData = null) => {
  try {
    // Prepare payload for n8n webhook
    const payload = {
      message: message,
      conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
      timestamp: new Date().toISOString(),
    };

    // Add image data if present (convert to base64)
    if (imageData) {
      payload.image = {
        data: imageData.buffer.toString('base64'),
        mimeType: imageData.mimetype,
      };
    }

    // Call n8n webhook
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET || ''}`, // Optional auth
      },
      body: JSON.stringify(payload),
      // Increase timeout for AI processing
      signal: AbortSignal.timeout(60000), // 60 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook error: ${response.status} - ${errorText}`);
    }

    let result = await response.json();

    // Handle AI Agent response format from n8n
    // N8N returns array format: [{ output: "AI response text" }]
    // Check if result is an array and get the first item
    if (Array.isArray(result) && result.length > 0) {
      result = result[0];
    }
    
    let aiMessage = '';
    
    if (result.output) {
      // AI Agent format
      aiMessage = result.output;
    } else if (result.text) {
      // Alternative text format
      aiMessage = result.text;
    } else if (result.message) {
      // Standard message format
      aiMessage = result.message;
    } else if (result.success && result.message) {
      // Legacy format with success flag
      aiMessage = result.message;
    } else if (typeof result === 'string') {
      // Direct string response
      aiMessage = result;
    } else {
      throw new Error('Invalid response format from webhook');
    }

    return {
      success: true,
      message: aiMessage.trim(),
      usage: result.usage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };

  } catch (error) {
    console.error('N8N Webhook error:', error);
    
    // Enhanced error categorization
    let errorMessage = "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment.";
    let errorType = 'unknown';
    
    // Check for specific error types
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      errorType = 'timeout';
      errorMessage = "⏱️ **Response Timeout**\n\nYour request took too long to process. Please try again with a shorter message or without large images.";
    } else if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      errorType = 'overload';
      errorMessage = "🚦 **Service Temporarily Busy**\n\n" +
                    "The AI service is experiencing high traffic right now.\n\n" +
                    "**What you can do:**\n" +
                    "* Wait 30-60 seconds and try again\n" +
                    "* Your message is saved - just resend it when ready\n\n" +
                    "Thank you for your patience! 🙏";
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      errorType = 'auth';
      errorMessage = "⚠️ **Service Configuration Issue**\n\nWebhook authentication failed. Please contact support for assistance.";
    } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      errorType = 'network';
      errorMessage = "🌐 **Connection Issue**\n\nUnable to reach the AI service. Please check your internet connection and try again.";
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message,
      errorType,
    };
  }
};

/**
 * Generate chat title from first message via n8n webhook
 * @param {string} firstMessage - First message in the chat
 * @returns {string} - Generated title
 */
export const generateChatTitle = async (firstMessage) => {
  try {
    // Use the AI Agent to generate a concise title
    const payload = {
      message: `Generate a short, descriptive title (2-6 words, max 50 characters) for this chat: "${firstMessage}". Return ONLY the title, nothing else.`,
      conversationHistory: [],
    };

    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET || ''}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 seconds timeout for title generation
    });

    if (!response.ok) {
      throw new Error('Title generation failed');
    }

    let result = await response.json();
    
    // N8N returns array format: [{ output: "AI response text" }]
    if (Array.isArray(result) && result.length > 0) {
      result = result[0];
    }
    
    // Handle AI Agent response format
    let title = '';
    if (result.output) {
      title = result.output.trim().replace(/['"]/g, '');
    } else if (result.text) {
      title = result.text.trim().replace(/['"]/g, '');
    } else if (result.title) {
      title = result.title.trim().replace(/['"]/g, '');
    } else if (result.message) {
      title = result.message.trim().replace(/['"]/g, '');
    }

    if (title && title.length <= 50) {
      return title;
    }

    // Fallback to truncated message
    return firstMessage.slice(0, 47) + '...';
    
  } catch (error) {
    console.error('Error generating chat title:', error);
    // Fallback to truncated first message
    return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
  }
};

/**
 * Analyze image content via n8n webhook
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} mimeType - Image MIME type
 * @param {string} userPrompt - Optional user prompt for image analysis
 * @returns {Object} - {success, analysis, error}
 */
export const analyzeImage = async (imageBuffer, mimeType, userPrompt = '') => {
  try {
    const payload = {
      action: 'analyze_image',
      image: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
      prompt: userPrompt || 'Please analyze this image and provide a detailed description.',
    };

    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET || ''}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000), // 60 seconds for image analysis
    });

    if (!response.ok) {
      throw new Error('Image analysis failed');
    }

    const result = await response.json();

    return {
      success: true,
      analysis: result.analysis?.trim() || 'Image analyzed successfully.',
    };
    
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      success: false,
      analysis: "I'm unable to analyze this image at the moment. Please try again later.",
      error: error.message,
    };
  }
};

export default { generateChatResponse, generateChatTitle, analyzeImage };
