"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiSend, FiX, FiMessageSquare, FiImage, FiUpload, FiSettings, FiMenu, FiUser } from "react-icons/fi";
import ToolSelector from "../../components/ToolSelector";
import ChatMessage from "../../components/ChatMessage";
import BharatAiLogo from "./logo";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]); // e.g. ['image-gen','upload']
  const [uploadedPreview, setUploadedPreview] = useState(null); // URL
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when messages change
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
    // add upload tool as selected (if not already)
    setSelectedTools((prev) => (prev.includes("upload") ? prev : [...prev, "upload"]));
    // reset input so same file can be picked again if removed later
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
    if (!message.trim() && !uploadedPreview) return; // nothing to send
    
    // Mark first interaction as complete
    if (isFirstInteraction) {
      setIsFirstInteraction(false);
    }
    
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: message.trim() || "",
      image: uploadedPreview || null,
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    // keep tools state as is — typical UX: uploaded image persists until removed

    // Simulated AI response (replace with API call)
    setTimeout(() => {
      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: uploadedPreview
          ? "I can see your image! I can help you analyze it, describe it, or generate similar variations. What would you like me to do with it?"
          : `I understand you're asking about: "${userMsg.text}". I'm here to help you with any questions, tasks, or creative projects you have in mind. How can I assist you further?`,
      };
      setMessages((m) => [...m, assistantMsg]);
    }, 1000);
  }

  // Welcome Screen (like ChatGPT initial screen)
  if (isFirstInteraction && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col relative overflow-y-auto">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        {/* Main Content */}
  <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pb-32 sm:pb-0">
          {/* Logo and Branding */}
          <div className="text-center mb-12">
            <div className="flex justify-center mt-5 mb-6">
              <BharatAiLogo size="lg"/>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your intelligent AI assistant powered by advanced machine learning. 
              Ask questions, generate content, analyze images, and explore ideas.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiMessageSquare className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Intelligent Conversations</h3>
              <p className="text-gray-600 text-sm">Engage in natural, context-aware conversations on any topic.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiImage className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Image Analysis</h3>
              <p className="text-gray-600 text-sm">Upload and analyze images with advanced AI vision capabilities.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiUpload className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">File Processing</h3>
              <p className="text-gray-600 text-sm">Upload and process various file types for analysis and insights.</p>
            </div>
          </div>

          {/* Input Area: Desktop/Tablet (>=sm) */}
          <div className="w-full max-w-3xl hidden sm:block mt-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Message Bharat AI..."
                    className="w-full border-0 rounded-xl px-4 py-4 focus:outline-none text-gray-700 placeholder-gray-500 text-lg bg-transparent"
                  />
                </div>
                <button
                  onClick={handleUploadClick}
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  title="Upload file"
                >
                  <FiUpload size={20} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  title="Send message"
                >
                  <FiSend size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            {/* Info Texts: Desktop/Tablet - below input */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Bharat AI can make mistakes. Consider checking important information.
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Made With ❤️ by Sagar Gupta
            </p>
          </div>

          {/* Info Texts: Mobile - below cards, above fixed input */}
          <div className="w-full max-w-3xl mx-auto sm:hidden px-6">
            <p className="text-center text-sm text-gray-500 ">
              Bharat AI can make mistakes. <br />Consider checking important information.
            </p>
            <p className="text-center text-sm text-gray-500 mt-3">
              Made With ❤️ by Sagar Gupta
            </p>
          </div>

        </div>

        {/* Input Area: Mobile (<sm) sticky at bottom */}
        <div className="w-full max-w-3xl mx-auto sm:hidden" style={{position:'fixed',left:0,right:0,bottom:0,zIndex:20,width:'100%',maxWidth:'100vw',background:'rgba(255,255,255,0.95)',boxShadow:'0 -2px 16px rgba(0,0,0,0.04)',borderTop:'1px solid #e5e7eb',padding:'8px 0',backdropFilter:'blur(8px)'}}>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-2 mx-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Message Bharat AI..."
                  className="w-full border-0 rounded-xl px-4 py-4 focus:outline-none text-gray-700 placeholder-gray-500 text-lg bg-transparent"
                />
              </div>
              <button
                onClick={handleUploadClick}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="Upload file"
              >
                <FiUpload size={20} />
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                title="Send message"
              >
                <FiSend size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
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

  // Chat Interface (like WhatsApp/ChatGPT with sidebar)
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
              onClick={() => setIsSidebarOpen(false)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
            >
              <FiMessageSquare size={16} />
              <span className="text-sm">New Chat</span>
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
            >
              <FiSettings size={16} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto h-full">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
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
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <FiUser size={20} className="text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4"
          style={{ minHeight: 0 }}
        >
          {messages.map((m) => (
            <div key={m.id} className="animate-fadeIn">
              <ChatMessage msg={m} />
            </div>
          ))}
        </div>

        {/* Tools and Upload Preview */}
        <div className="px-4 sm:px-6 flex-shrink-0">
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
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-end gap-2 sm:gap-4">
            <div className="flex-1">
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
              onClick={handleUploadClick}
              className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Upload file"
            >
              <FiUpload size={18} className="sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!message.trim() && !uploadedPreview}
              className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
              title="Send message"
            >
              <FiSend size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3 text-center hidden sm:block">
            Press Enter to send, Shift+Enter for new line
          </p>
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
