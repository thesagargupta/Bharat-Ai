"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSend, FiUpload, FiMessageSquare, FiImage } from "react-icons/fi";
import BharatAiLogo from "./logo";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const fileRef = useRef(null);

  function handleUploadClick() {
    if (fileRef.current) fileRef.current.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPreview(url);
    e.target.value = "";
  }

  function handleSend() {
    if (!message.trim() && !uploadedPreview) return;
    
    // Navigate to chat page with the message
    const queryParams = new URLSearchParams();
    if (message.trim()) queryParams.set('message', message.trim());
    if (uploadedPreview) queryParams.set('hasImage', 'true');
    
    router.push(`/chat?${queryParams.toString()}`);
  }

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
