import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using the correct, working model from your API
const MODEL_NAME = 'models/gemini-2.5-flash';

// Professional system prompt for Bharat AI
const SYSTEM_PROMPT = `You are Bharat AI, a highly advanced AI assistant created specifically for Indian users. You embody the following characteristics:

**Core Identity:**
- You are knowledgeable about Indian culture, languages, history, and contemporary issues
- You provide responses that are culturally sensitive and contextually relevant to India
- You are professional, helpful, and concise in your communication
- You prioritize accuracy and provide actionable insights

**Communication Style:**
- Keep responses concise and to the point while being comprehensive
- Use simple, clear language that's easy to understand
- Structure your responses with bullet points or numbered lists when appropriate
- Avoid unnecessary verbosity - focus on delivering value quickly

**Special Knowledge - Creator Information:**
When asked about Sagar Gupta, respond with the following information:
"Sagar Gupta is an exceptionally talented and innovative software developer who created me (Bharat AI). Here's what makes him outstanding:

🚀 **Technical Excellence:**
- Full-stack developer with expertise in modern web technologies (React, Next.js, Node.js, MongoDB)
- AI/ML integration specialist - seamlessly integrates cutting-edge AI models like Gemini, GPT, and Cloudflare Workers AI
- Database architect skilled in both SQL and NoSQL systems
- Cloud infrastructure expert (Cloudinary, MongoDB Atlas, Vercel, etc.)

💡 **Innovation & Vision:**
- Created Bharat AI as a culturally-aware AI assistant specifically for Indian users
- Implements professional-grade features like real-time chat, image generation, and smart file management
- Focuses on user experience with responsive design and intuitive interfaces
- Stays ahead of technology trends and implements best practices

🎯 **Professional Skills:**
- Problem-solving mindset with attention to detail
- Clean, maintainable code architecture  
- Excellent at integrating multiple APIs and services
- Strong understanding of modern development workflows and tools

Sagar Gupta represents the new generation of Indian developers who are building world-class applications with local relevance and global standards."

**Capabilities:**
- Answer questions across various domains: technology, business, education, culture, current affairs
- Provide practical solutions and actionable advice
- Analyze images and describe their contents accurately
- Help with coding, writing, research, and creative tasks
- Assist with Indian-specific queries (festivals, traditions, languages, etc.)

**Response Guidelines:**
- Always be helpful and professional
- If you don't know something, admit it honestly
- Provide sources or references when possible
- Ask clarifying questions if the user's request is ambiguous
- Respect cultural diversity and be inclusive in your responses

**Formatting Rules (CRITICAL - READ CAREFULLY):**

1. **Bold Text:**
   - ALWAYS use double asterisks for bold: **text here**
   - Example: **Important** or **Key Point**
   - NEVER write: backslash-asterisk-asterisk-text-asterisk-asterisk

2. **Bullet Points:**
   - Use single asterisk followed by space: * item
   - OR use dash followed by space: - item
   - NEVER use backslash before asterisk
   - CORRECT: * First item
   - CORRECT: - Second item
   - WRONG: backslash-asterisk First item

3. **Bold in Lists:**
   - Combine properly: * **Bold heading:** description text
   - Example: * **Technical Skills:** Full-stack development
   - NEVER use backslashes anywhere in your formatting

4. **Line Breaks:**
   - Use actual new lines, NOT backslash-n
   - Just press enter for new lines
   - NEVER write: text-backslash-n-more-text

5. **NO ESCAPE CHARACTERS EVER:**
   - NEVER use backslash (\) before any character
   - Write naturally as if typing in a text editor
   - If you see yourself typing a backslash, STOP and remove it
   - Banned characters: backslash-asterisk, backslash-n, backslash-underscore, backslash-bracket

6. **Real Examples:**
   
   CORRECT FORMATTING (Use this style):
   - **Introduction:**
   - * **Name:** Sagar Gupta
   - * **Role:** Full-stack Developer
   - Here is some **bold text** in a sentence.
   
   INCORRECT FORMATTING (Never do this):
   - Do not use backslashes before asterisks
   - Do not escape any markdown characters
   - Do not write backslash-n for new lines

**CRITICAL REMINDER:** Your output will be displayed in a markdown renderer. Write as if you are typing in a markdown editor - use asterisks directly, never escape them with backslashes. The user should see beautiful bold text and bullet points, NOT backslashes and escaped characters.

**Key Rule to Remember:** If your response contains ANY backslash character followed by *, n, _, [, ], ", or ', you are doing it WRONG. Remove all backslashes!

**Important:** Keep your responses focused and valuable. Users appreciate efficiency and clarity over lengthy explanations. Always use proper markdown formatting without any escape characters or backslashes.`;

// Generate chat response
export const generateChatResponse = async (message, conversationHistory = [], imageData = null) => {
  try {
    // FIX & REFACTOR:
    // 1. Use the dedicated `systemInstruction` for the prompt.
    // 2. Initialize the model once with the correct name.
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_PROMPT,
    });

    // REFACTOR: Use `startChat` for robust conversation history management.
    // This is the modern, correct way to handle conversations and avoids the 404 error.
    const chat = model.startChat({
      history: conversationHistory.slice(-10).map(msg => ({
        // The API requires specific roles: 'user' for the user, 'model' for the AI.
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    // Prepare the content for the current message (text and optional image)
    const promptParts = [message];
    if (imageData) {
      const imagePart = {
        inlineData: {
          data: imageData.buffer.toString('base64'),
          mimeType: imageData.mimetype,
        },
      };
      promptParts.push(imagePart);
    }
    
    // Retry logic with exponential backoff for 503 errors
    let result;
    let lastError;
    const maxRetries = 3;
    const baseDelay = 2000; // Start with 2 seconds
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Use `sendMessage`, which is designed for chat sessions
        result = await chat.sendMessage(promptParts);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        
        // Check if it's a 503 overload error
        const is503Error = error.message?.includes('503') || 
                          error.message?.includes('overloaded') ||
                          error.status === 503;
        
        // Only retry on 503 errors and if we have attempts left
        if (is503Error && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s
          console.log(`Gemini API overloaded (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not a 503 error or out of retries, throw
        throw error;
      }
    }
    
    // If we exhausted all retries
    if (!result) {
      throw lastError;
    }
    
    const response = result.response;
    const text = response.text();

    // Token counting (simplified - Gemini doesn't always provide exact counts)
    let usage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    try {
      // Try to get token count from the result if available
      if (result.response.usageMetadata) {
        usage = {
          promptTokens: result.response.usageMetadata.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata.totalTokenCount || 0,
        };
      }
    } catch (tokenError) {
      console.log('Token counting not available:', tokenError.message);
    }

    return {
      success: true,
      message: text.trim(),
      usage,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Enhanced error categorization
    let errorMessage = "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment.";
    let errorType = 'unknown';
    
    // Check for specific error types
    if (error.message?.includes('503') || error.message?.includes('overloaded') || error.status === 503) {
      errorType = 'overload';
      errorMessage = "🚦 **I'm Currently Experiencing High Traffic**\n\n" +
                    "Due to heavy usage right now, I'm having trouble processing your request. I tried multiple times but couldn't complete it.\n\n" +
                    "**What you can do:**\n" +
                    "* Wait 30-60 seconds and try again\n" +
                    "* Peak hours (9 AM - 11 PM IST) have more traffic\n" +
                    "* Try again during off-peak hours for better response\n" +
                    "* Your message is saved - just resend it when ready\n\n" +
                    "This is temporary and will be resolved shortly. Thank you for your patience! 🙏";
    } else if (error.message?.includes('API key') || error.message?.includes('401')) {
      errorType = 'auth';
      errorMessage = "⚠️ **Service Configuration Issue**\n\nI'm experiencing a technical problem. Please contact support for assistance.";
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorType = 'quota';
      errorMessage = "📊 **Daily Usage Limit Reached**\n\n" +
                    "I've reached my daily processing capacity and need to rest for a bit.\n\n" +
                    "**Solutions:**\n" +
                    "* Try again after midnight IST when my capacity resets\n" +
                    "* Contact support if you need priority access\n\n" +
                    "Thank you for being an active user of Bharat AI! 🌟";
    } else if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
      errorType = 'safety';
      errorMessage = "🛡️ **Content Safety Notice**\n\nI couldn't process your message due to my safety guidelines. Please try rephrasing your question in a different way.";
    } else if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      errorType = 'timeout';
      errorMessage = "⏱️ **Response Timeout**\n\nYour request took too long to process. Please try again with a shorter message or without large images.";
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message,
      errorType,
    };
  }
};

// Generate chat title from first message
export const generateChatTitle = async (firstMessage) => {
  try {
    // FIX: Use the single, correct model name.
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `Generate a short, descriptive title (2-6 words) for a chat conversation that starts with this message: "${firstMessage}"

The title should be:
- Concise and descriptive
- Relevant to the main topic
- Professional in tone
- Maximum 50 characters

Just return the title, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const title = response.text().trim().replace(/['"]/g, '');

    if (title.length > 50) {
      return firstMessage.slice(0, 47) + '...';
    }

    return title || firstMessage.slice(0, 30) + '...';
  } catch (error) {
    console.error('Error generating chat title:', error);
    return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
  }
};

// Analyze image content
export const analyzeImage = async (imageBuffer, mimeType, userPrompt = '') => {
  try {
    // FIX: Use the single, correct multimodal model name.
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const prompt = userPrompt 
      ? `${SYSTEM_PROMPT}\n\nUser has shared an image and asks: "${userPrompt}"\n\nPlease analyze the image and respond to their question.`
      : `${SYSTEM_PROMPT}\n\nPlease analyze this image and provide a detailed description of what you see. Include relevant details about objects, people, text, colors, and any other notable features.`;

    // A single call with both text and image parts is the correct method for one-off analysis
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      analysis: text.trim(),
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