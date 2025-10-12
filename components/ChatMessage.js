"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiUser, FiCpu, FiCopy, FiCheck, FiDownload } from "react-icons/fi";

// Enhanced text processing function
const processText = (text) => {
  if (!text) return [];
  
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }
    
    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim()
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
};

// Code block component
const CodeBlock = ({ language, content }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  return (
    <div className="my-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300 font-medium">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          {copied ? (
            <>
              <FiCheck size={14} />
              Copied!
            </>
          ) : (
            <>
              <FiCopy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        <pre className="text-sm text-gray-100 overflow-x-auto whitespace-pre-wrap break-words">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};

export default function ChatMessage({ msg, onImageClick }) {
  const isUser = msg.role === "user";
  const textParts = processText(msg.text);
  
  // Helper function to get valid image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If image is a string, return it directly
    if (typeof image === 'string' && image.trim() !== '') {
      return image;
    }
    
    // If image is an object with url property
    if (typeof image === 'object' && image.url && typeof image.url === 'string' && image.url.trim() !== '') {
      return image.url;
    }
    
    // No valid image URL found
    return null;
  };
  
  const imageUrl = getImageUrl(msg.image);
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
        }`}>
          {isUser ? <FiUser size={16} /> : <FiCpu size={16} />}
        </div>

        <div className={`flex-1 min-w-0 ${isUser ? "text-right" : "text-left"}`}>
          <div
            className={`inline-block max-w-full px-5 py-3 rounded-2xl shadow-lg ${
              isUser
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                : !textParts.some(part => part.type === 'code') 
                  ? "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                  : "bg-transparent text-gray-800"
            }`}
          >
            {msg.text && (
              <div className="text-sm leading-relaxed">
                {textParts.map((part, index) => {
                  if (part.type === 'code') {
                    return <CodeBlock key={index} language={part.language} content={part.content} />;
                  } else {
                    return (
                      <div key={index} className="whitespace-pre-wrap break-words">
                        {part.content.split('\n').map((line, lineIndex) => (
                          <React.Fragment key={lineIndex}>
                            {line}
                            {lineIndex < part.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  }
                })}
              </div>
            )}
            {imageUrl && (
              <div className="mt-3">
                <div className="relative inline-block group">
                  <img
                    src={imageUrl}
                    alt="Generated or attached image"
                    className="w-full max-w-md max-h-64 object-cover rounded-xl border shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.target.style.display = 'none';
                      console.error('Failed to load image:', imageUrl);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Image clicked, URL:', imageUrl);
                      // Image click handled by parent component
                      if (onImageClick) {
                        onImageClick(imageUrl);
                      }
                    }}
                  />
                  {/* Click indicator overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-lg">
                      Click icon to view full size
                    </div>
                  </div>
                  
                  {/* Download button overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (imageUrl) {
                          // Create download link
                          const link = document.createElement('a');
                          link.href = imageUrl;
                          link.download = `bharat-ai-image-${Date.now()}.png`;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg"
                      title="Download image"
                    >
                      <FiDownload size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`text-xs mt-2 ${isUser ? "text-gray-400" : "text-gray-500"}`}>
            {isUser ? "You" : "Bharat AI"}
          </div>
        </div>
      </div>
    </div>
  );
}