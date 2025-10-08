"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdDelete } from "react-icons/md";
import { BiMenuAltLeft } from "react-icons/bi";
import Image from "next/image";
import { FiSend, FiX, FiMessageSquare, FiSettings, FiMenu, FiUser, FiUpload } from "react-icons/fi";
import ToolSelector from "../../../components/ToolSelector";
import ChatMessage from "../../../components/ChatMessage";

function ChatContent() {
  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({ open: false, chatId: null });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // ALL HOOKS MUST BE AT THE TOP - Before any conditional returns
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  // Load chats from localStorage only once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bharatai_chats');
      if (saved) {
        try {
          setChats(JSON.parse(saved));
        } catch {
          setChats([]);
        }
      }
    }
  }, []);

  // Track if all chats have been deleted (for future use, but do not block new chat creation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (chats.length === 0) {
        localStorage.setItem('bharatai_chats_deleted', 'true');
      } else {
        localStorage.removeItem('bharatai_chats_deleted');
      }
    }
  }, [chats]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const messageCounter = useRef(0);
  const hasInitialized = useRef(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    }
  }, [status, router]);

  // Persist chats to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bharatai_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Track if chats have loaded from localStorage
  const [chatsLoaded, setChatsLoaded] = useState(false);
  useEffect(() => {
    if (!chatsLoaded && chats.length >= 0) {
      setChatsLoaded(true);
    }
  }, [chats]);

  useEffect(() => {
    // Only run after chats are loaded from localStorage
    if (!chatsLoaded || hasInitialized.current) return;
    const initialMessage = searchParams.get('message');
    if (initialMessage) {
      hasInitialized.current = true;
      // Always create a new chat for a new message from landing page
      const topic = initialMessage.slice(0, 30) || "New Chat";
      const newChatId = `chat-${Date.now()}`;
      const userMsg = {
        id: `msg-${Date.now()}-1`,
        role: "user",
        text: initialMessage,
        image: null,
      };
      const assistantMsg = {
        id: `msg-${Date.now()}-2`,
        role: "assistant",
        text: `I understand you're asking about: "${initialMessage}". I'm here to help you with any questions, tasks, or creative projects you have in mind. How can I assist you further?`,
      };
      const newChat = {
        id: newChatId,
        topic,
        messages: [userMsg, assistantMsg],
        created: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      setMessages([userMsg, assistantMsg]);
      // Remove message param from URL so it doesn't trigger again on refresh
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [searchParams, chatsLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When currentChatId changes, load its messages
  useEffect(() => {
    if (!currentChatId) return;
    const chat = chats.find((c) => c.id === currentChatId);
    if (chat) setMessages(chat.messages);
  }, [currentChatId]);
  
  // Show loading state while checking authentication (AFTER all hooks)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render content until authenticated (AFTER all hooks)
  if (status === "unauthenticated") {
    return null;
  }

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

    // If no chat exists, create a new chat
    if (!currentChatId) {
      const newChatId = `chat-${Date.now()}`;
      const newChat = {
        id: newChatId,
        topic: userMsg.text.slice(0, 30) || "New Chat",
        messages: [userMsg],
        created: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      setMessages([userMsg]);

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
        setChats((prev) => prev.map((chat) =>
          chat.id === newChatId
            ? { ...chat, messages: [...chat.messages, assistantMsg] }
            : chat
        ));
      }, 1000);
      setMessage("");
      return;
    }

    // Otherwise, add to current chat
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
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
      const newMessages = [...updatedMessages, assistantMsg];
      setMessages(newMessages);
      // Update chat topic if first message
      if (currentChatId) {
        setChats((prev) => prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: newMessages, topic: chat.messages.length === 0 ? userMsg.text.slice(0, 30) || "New Chat" : chat.topic }
            : chat
        ));
      }
    }, 1000);
    // Update chat messages
    if (currentChatId) {
      setChats((prev) => prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: updatedMessages, topic: chat.messages.length === 0 ? userMsg.text.slice(0, 30) || "New Chat" : chat.topic }
          : chat
      ));
    }
  }

  function handleNewChat() {
    // Create a new chat and switch to it
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      topic: "New Chat",
      messages: [],
      created: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setUploadedPreview(null);
    setSelectedTools([]);
  }

  function handleSelectChat(chatId) {
    setCurrentChatId(chatId);
    setUploadedPreview(null);
    setSelectedTools([]);
  }

  function openDeleteModal(chatId) {
    setDeleteModal({ open: true, chatId });
  }

  function closeDeleteModal() {
    setDeleteModal({ open: false, chatId: null });
  }

  function confirmDeleteChat() {
    const chatId = deleteModal.chatId;
    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);
    if (currentChatId === chatId) {
      // If deleted current chat, switch to first available
      const nextChat = updatedChats[0];
      if (nextChat) {
        setCurrentChatId(nextChat.id);
        setMessages(nextChat.messages);
      } else {
        setCurrentChatId(null);
        setMessages([]);
        // If no chats left, refresh page to reset state
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
      }
    }
    closeDeleteModal();
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
        <div className="flex-1 p-4 overflow-y-auto">
          <button 
            onClick={handleNewChat}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700 mb-2"
            style={{ fontWeight: 500 }}
          >
            <FiMessageSquare size={16} />
            <span className="text-sm">New Chat</span>
          </button>
          {/* Thin grey line */}
          <div className="border-t border-gray-200 my-2" style={{ height: '1px' }} />
          {/* Chat list */}
          <div className="space-y-1">
            {chats.length === 0 && (
              <div className="text-xs text-gray-400 px-2 py-2">No chats yet</div>
            )}
            {chats.map((chat) => (
              <div key={chat.id} className={`flex items-center group rounded-lg px-2 py-2 cursor-pointer ${currentChatId === chat.id ? 'bg-gray-100 border border-gray-200' : 'hover:bg-gray-50'}`}
                onClick={() => handleSelectChat(chat.id)}
                style={{ transition: 'background 0.2s' }}
              >
                <div className="flex-1 truncate">
                  <span className="text-sm text-gray-800 font-medium truncate">{chat.topic || 'New Chat'}</span>
                </div>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-500"
                  title="Delete chat"
                  onClick={e => { e.stopPropagation(); openDeleteModal(chat.id); }}
                >
                  <MdDelete size={16} />
                </button>
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm border border-gray-200 animate-fadeIn">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 text-red-600 rounded-full p-2">
                <FiX size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Chat?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to delete this chat? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
                autoFocus
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
              </div>
            ))}
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
                <BiMenuAltLeft size={24} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Chat with Bharat AI</h1>
                <p className="text-xs sm:text-sm text-gray-500">Online now</p>
              </div>
            </div>
            {/* User Avatar */}
            <button 
              onClick={() => router.push('/profile')}
              className="relative hover:opacity-80 transition-opacity group"
              title="View Profile"
            >
              {session?.user?.image ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized={session.user.image.startsWith('http')}
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                  <FiUser size={20} className="text-white" />
                </div>
              )}
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
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group flex-shrink-0"
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
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
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

// Loading fallback component
function ChatLoading() {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chat...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatContent />
    </Suspense>
  );
}
