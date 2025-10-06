"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FiSend, FiX, FiMessageSquare, FiSettings, FiMenu, FiUser, FiUpload } from "react-icons/fi";
import ToolSelector from "../../../components/ToolSelector";
import ChatMessage from "../../../components/ChatMessage";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const messageCounter = useRef(0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Get initial message from URL params only once
    if (hasInitialized.current) return;
    
    const initialMessage = searchParams.get('message');
    if (initialMessage) {
      hasInitialized.current = true;
      
      // Create initial user message
      messageCounter.current += 1;
      const userMsg = {
        id: `msg-${Date.now()}-${messageCounter.current}`,
        role: "user",
        text: initialMessage,
        image: null,
      };
      setMessages([userMsg]);

      // Simulate AI response
      setTimeout(() => {
        messageCounter.current += 1;
        const assistantMsg = {
          id: `msg-${Date.now()}-${messageCounter.current}`,
          role: "assistant",
          text: `I understand you're asking about: "${initialMessage}". I'm here to help you with any questions, tasks, or creative projects you have in mind. How can I assist you further?`,
        };
        setMessages((m) => [...m, assistantMsg]);
      }, 1000);
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }

  function toggleTool(id) {
    setSelectedTools((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  }

  function handleUploadClick() {
    if (fileRef.current) fileRef.current.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPreview(url);
    setSelectedTools((prev) => (prev.includes("upload") ? prev : [...prev, "upload"]));
    e.target.value = "";
  }

  function removeTool(tool) {
    setSelectedTools((prev) => prev.filter((p) => p !== tool));
    if (tool === "upload") {
      if (uploadedPreview) {
        URL.revokeObjectURL(uploadedPreview);
        setUploadedPreview(null);
      }
    }
  }

  function handleSend() {
    if (!message.trim() && !uploadedPreview) return;
    
    messageCounter.current += 1;
    const userMsg = {
      id: `msg-${Date.now()}-${messageCounter.current}`,
      role: "user",
      text: message.trim() || "",
      image: uploadedPreview || null,
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");

    // Simulated AI response
    setTimeout(() => {
      messageCounter.current += 1;
      const assistantMsg = {
        id: `msg-${Date.now()}-${messageCounter.current}`,
        role: "assistant",
        text: uploadedPreview
          ? "I can see your image! I can help you analyze it, describe it, or generate similar variations. What would you like me to do with it?"
          : `I understand you're asking about: "${userMsg.text}". I'm here to help you with any questions, tasks, or creative projects you have in mind. How can I assist you further?`,
      };
      setMessages((m) => [...m, assistantMsg]);
    }, 1000);
  }

  function handleNewChat() {
    router.push('/');
  }

  return (
    <div className="h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white rounded-full p-2 shadow-lg">
                  <Image 
                    src="/logo.png" 
                    alt="Bharat AI Logo" 
                    width={40} 
                    height={40} 
                    className="rounded-full" 
                  />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Bharat AI</h2>
                <p className="text-sm text-gray-500">AI Assistant</p>
              </div>
            </div>
            {/* Close button - Mobile Only */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <FiX size={24} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              onClick={handleNewChat}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
            >
              <FiMessageSquare size={16} />
              <span className="text-sm">New Chat</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer - Settings */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => router.push('/setting')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
          >
            <FiSettings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto h-full min-h-0">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu - Mobile Only */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <FiMenu size={24} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Chat with Bharat AI</h1>
                <p className="text-xs sm:text-sm text-gray-500">Online now</p>
              </div>
            </div>
            {/* User Icon */}
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
              title="View Profile"
            >
              <FiUser size={20} className="text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-4"
          style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}
        >
          {messages.map((m) => (
            <div key={m.id} className="animate-fadeIn">
              <ChatMessage msg={m} />
            </div>
          ))}
        </div>

        {/* Tools and Upload Preview */}
        <div className="px-4 sm:px-6 flex-shrink-0 pb-2">
          <ToolSelector
            selected={selectedTools}
            onToggle={toggleTool}
            onUploadClick={handleUploadClick}
            onRemove={removeTool}
          />

          {uploadedPreview && (
            <div className="mt-4 flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="relative">
                <img 
                  src={uploadedPreview} 
                  alt="preview" 
                  className="w-24 h-18 object-cover rounded-lg border border-white shadow-sm" 
                />
                <button
                  onClick={() => removeTool("upload")}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <FiX size={10} />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Image attached</p>
                <p className="text-xs text-gray-500">Ready to analyze</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div 
          className="flex-shrink-0 sticky bottom-0 left-0 right-0"
          style={{
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 -2px 16px rgba(0,0,0,0.04)',
            borderTop: '1px solid #e5e7eb',
            padding: '8px 0',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Desktop Input */}
          <div className="hidden sm:flex items-end gap-4 px-6 pb-4">
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full border-0 bg-transparent px-4 py-3 focus:outline-none resize-none text-gray-700 placeholder-gray-500"
                  style={{
                    minHeight: '44px',
                    maxHeight: '120px',
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() && !uploadedPreview}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group flex-shrink-0"
              title="Send message"
            >
              <FiSend size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Input - Same styling as landing page */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-2 mx-2 sm:hidden">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 300);
                  }}
                  placeholder="Message Bharat AI..."
                  rows={1}
                  className="w-full border-0 rounded-xl px-4 py-4 focus:outline-none text-gray-700 placeholder-gray-500 text-lg bg-transparent resize-none"
                  style={{
                    minHeight: '44px',
                    maxHeight: '100px',
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() && !uploadedPreview}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                title="Send message"
              >
                <FiSend size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
