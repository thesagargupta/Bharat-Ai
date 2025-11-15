"use client";
import { useEffect, useRef } from "react";

export function useAutoScroll(isTyping, messages) {
  const typingRef = useRef(null);
  const lastMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);

  // Professional auto-scroll: Scroll to show new messages at the START (like ChatGPT/Gemini)
  useEffect(() => {
    if (isTyping && typingRef.current) {
      setTimeout(() => {
        typingRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isTyping]);

  // Scroll to show new AI messages when they arrive
  useEffect(() => {
    if (!isTyping && messages.length > 0 && lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [messages.length, isTyping]);

  const scrollToBottom = (smooth = true) => {
    if (!scrollRef.current) return;
    
    if (smooth && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    } else {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return {
    scrollRef,
    typingRef,
    lastMessageRef,
    messagesEndRef,
    scrollToBottom
  };
}
