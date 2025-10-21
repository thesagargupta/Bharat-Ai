"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdDelete } from "react-icons/md";
import { BiMenuAltLeft } from "react-icons/bi";
import Image from "next/image";
import { FiSend, FiX, FiMessageSquare, FiSettings, FiUser, FiUpload, FiImage } from "react-icons/fi";
import { errorToast, confirmToast } from '../../../lib/toast';
import ToolSelector from "../../../components/ToolSelector";
import ChatMessage from "../../../components/ChatMessage";
import ImageModal from "../../../components/ImageModal";

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
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isImageGenMode, setIsImageGenMode] = useState(false);
  const [isProcessingInitialMessage, setIsProcessingInitialMessage] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: null });
  const [userAvatar, setUserAvatar] = useState(null); // State for user's profile avatar

  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const messageCounter = useRef(0);
  const hasInitialized = useRef(false);
  const typingRef = useRef(null);
  
  // IMPLEMENTED: Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    }
  }, [status, router]);

  // Auto scroll to typing animation
  useEffect(() => {
    if (isTyping && typingRef.current) {
      setTimeout(() => {
        typingRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }, 100);
    }
  }, [isTyping]);

  // Handle image generation
  async function handleImageGeneration(prompt) {
    setIsTyping(true);
    
    try {
      // Add user message to UI immediately
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: `🎨 Generate image: ${prompt}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, tempUserMessage]);

      // Generate image
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'stable-diffusion',
          size: '1024x1024'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create AI response with generated image
        const aiResponse = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: `I've generated an image based on your prompt: "${prompt}"`,
          image: { url: data.image.url },
          timestamp: new Date(),
        };

        // Update messages - remove temp and add both user and AI messages
        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
          return [...withoutTemp, tempUserMessage, aiResponse];
        });

        // Save image generation to chat database
        try {
          const chatResponse = await fetch('/api/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `🎨 Generate image: ${prompt}`,
              chatId: currentChatId,
              generatedImageUrl: data.image.url,
            }),
          });

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            
            // Update messages with real database IDs - the image should already be in the response
            setMessages(prev => {
              // Filter out all temp messages and any duplicates
              const withoutTempAndDuplicates = prev.filter(msg => 
                msg.id.startsWith('temp-') || msg.id.startsWith('ai-')
              );
              
              // Add user message and AI response with proper IDs from database
              const userMsg = {
                id: chatData.userMessage.id,
                role: chatData.userMessage.role,
                content: `🎨 Generate image: ${prompt}`,
                image: chatData.userMessage.image,
                timestamp: chatData.userMessage.timestamp,
              };
              const aiMsg = {
                id: chatData.assistantMessage.id,
                role: chatData.assistantMessage.role,
                content: `I've generated an image based on your prompt: "${prompt}"`,
                image: chatData.assistantMessage.image,
                timestamp: chatData.assistantMessage.timestamp,
              };
              
              // Get messages that are not temp and not the new ones
              const existingMessages = prev.filter(msg => 
                !msg.id.startsWith('temp-') && 
                !msg.id.startsWith('ai-') &&
                msg.id !== userMsg.id &&
                msg.id !== aiMsg.id
              );
              
              return [...existingMessages, userMsg, aiMsg];
            });

            // Update chat list
            if (chatData.isNewChat) {
              const newChat = {
                id: chatData.chatId,
                title: chatData.chatTitle,
                messageCount: 2,
                lastMessage: `Generated image: ${prompt.slice(0, 50)}...`,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setChats(prev => [newChat, ...prev]);
              setCurrentChatId(chatData.chatId);
            } else {
              setChats(prev => prev.map(chat => 
                chat.id === currentChatId 
                  ? {
                      ...chat,
                      messageCount: chat.messageCount + 2,
                      lastMessage: `Generated image: ${prompt.slice(0, 50)}...`,
                      updatedAt: new Date(),
                    }
                  : chat
              ));
            }
          }
        } catch (saveError) {
          console.error('Error saving to chat:', saveError);
        }

        // Exit image generation mode
        setIsImageGenMode(false);
        
      } else {
        const errorData = await response.json();
        // Remove temp message and show error
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
        errorToast(errorData.error || 'Failed to generate image');
      }

    } catch (error) {
      console.error('Error generating image:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id.startsWith('temp-')));
      errorToast('An error occurred while generating the image.');
    } finally {
      setIsTyping(false);
    }
  }

  // Load user profile data (avatar)
  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user) {
        try {
          // Add cache-busting to force fresh data
          const response = await fetch('/api/user/profile', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          if (response.ok) {
            const data = await response.json();
            // Set the user avatar from customImage or fallback to session image
            setUserAvatar(data.user.image);
            console.log('User avatar loaded:', data.user.image);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to session image
          setUserAvatar(session.user.image);
        }
      }
    };

    if (session?.user) {
      loadUserProfile();
    }

    // Reload profile when window gains focus (user returns from another tab/page)
    const handleFocus = () => {
      if (session?.user) {
        console.log('Window focused - reloading user profile');
        loadUserProfile();
      }
    };

    // Reload profile when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user) {
        console.log('Page visible - reloading user profile');
        loadUserProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  // Load chats from database
  useEffect(() => {
    const loadChats = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/chats');
          if (response.ok) {
            const data = await response.json();
            setChats(data.chats);
            
            // Load the most recent chat if available
            if (data.chats.length > 0 && !currentChatId) {
              const recentChat = data.chats[0];
              await loadChatMessages(recentChat.id);
            }
          }
        } catch (error) {
          console.error('Error loading chats:', error);
        } finally {
          setIsLoadingChats(false);
        }
      }
    };

    if (session?.user) {
      loadChats();
    }
  }, [session]);

  // Handle initial message from URL
  useEffect(() => {
    const handleInitialMessage = async () => {
      if (hasInitialized.current || !session?.user) return;
      
      const initialMessage = searchParams.get('message');
      if (initialMessage && !isLoadingChats) {
        hasInitialized.current = true;
        setIsProcessingInitialMessage(true);
        
        // Show user message immediately for instant feedback
        const tempUserMessage = {
          id: `temp-user-${Date.now()}`,
          role: "user",
          content: initialMessage,
          timestamp: new Date(),
        };
        
        setMessages([tempUserMessage]);
        setIsTyping(true);
        
        try {
          // Send message to create new chat with AI response
          const response = await fetch('/api/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: initialMessage,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Add new chat to the list
            const newChat = {
              id: data.chatId,
              title: data.chatTitle,
              messageCount: 2,
              lastMessage: data.assistantMessage.content.slice(0, 100),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            setChats(prev => [newChat, ...prev]);
            setCurrentChatId(data.chatId);
            // Replace temp message with real messages
            setMessages([data.userMessage, data.assistantMessage]);
          } else {
            // Remove temp message on error
            setMessages([]);
            console.error('Error sending initial message');
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
          // Remove temp message on error
          setMessages([]);
        } finally {
          setIsTyping(false);
          setIsProcessingInitialMessage(false);
        }

        // Remove message param from URL
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('message');
          window.history.replaceState({}, '', url.pathname + url.search);
        }
      }
    };

    handleInitialMessage();
  }, [searchParams, session, isLoadingChats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for a specific chat
  const loadChatMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentChatId(chatId);
        setMessages(data.chat.messages);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };
  
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
  
  // IMPLEMENTED: Don't render content until authenticated (AFTER all hooks)
  if (status === "unauthenticated") {
    return null;
  }

  function scrollToBottom() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }

  function toggleTool(id) {
    if (id === "image-gen") {
      setIsImageGenMode(!isImageGenMode);
      // Clear other selected tools when switching to image gen mode
      if (!isImageGenMode) {
        setSelectedTools([]);
        setUploadedPreview(null);
      }
    } else {
      // Disable image gen mode when selecting other tools
      setIsImageGenMode(false);
      setSelectedTools((prev) => {
        if (prev.includes(id)) return prev.filter((p) => p !== id);
        return [...prev, id];
      });
    }
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

  // Function to exit image generation mode
  function exitImageGenMode() {
    setIsImageGenMode(false);
    setMessage('');
  }

  // Handle image click for full view
  const handleImageClick = (imageUrl) => {
    console.log('Opening image modal with URL:', imageUrl);
    setImageModal({
      isOpen: true,
      imageUrl
    });
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: null });
  };

  async function handleSend() {
    if (!message.trim() && !uploadedPreview) return;

    const messageText = message.trim();
    setMessage("");
    setIsTyping(true);
    
    try {
      // Handle image generation mode
      if (isImageGenMode) {
        await handleImageGeneration(messageText);
        return;
      }

      // Prepare image data if exists
      let imageData = null;
      if (uploadedPreview) {
        const response = await fetch(uploadedPreview);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        imageData = {
          data: Buffer.from(buffer).toString('base64'),
          type: blob.type,
        };
      }

      // Add user message to UI immediately
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: messageText,
        image: uploadedPreview ? { url: uploadedPreview } : undefined,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, tempUserMessage]);

      // Clear uploaded image immediately after adding user message
      if (uploadedPreview) {
        URL.revokeObjectURL(uploadedPreview);
        setUploadedPreview(null);
        setSelectedTools(prev => prev.filter(tool => tool !== "upload"));
      }

      // Send to API
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          chatId: currentChatId,
          imageData: imageData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update messages with real IDs and AI response
        setMessages(prev => {
          // Filter out temp messages and ensure no duplicates
          const withoutTemp = prev.filter(msg => 
            msg.id !== tempUserMessage.id && 
            msg.id !== data.userMessage.id && 
            msg.id !== data.assistantMessage.id
          );
          return [...withoutTemp, data.userMessage, data.assistantMessage];
        });

        // Update or add chat to list
        if (data.isNewChat) {
          const newChat = {
            id: data.chatId,
            title: data.chatTitle,
            messageCount: 2,
            lastMessage: data.assistantMessage.content.slice(0, 100),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setChats(prev => [newChat, ...prev]);
          setCurrentChatId(data.chatId);
        } else {
          // Update existing chat
          setChats(prev => prev.map(chat => 
            chat.id === data.chatId 
              ? {
                  ...chat,
                  messageCount: chat.messageCount + 2,
                  lastMessage: data.assistantMessage.content.slice(0, 100),
                  updatedAt: new Date(),
                }
              : chat
          ));
        }
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
        errorToast('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id.startsWith('temp-')));
      errorToast('An error occurred while sending your message.');
    } finally {
      setIsTyping(false);
    }
  }

  function handleNewChat() {
    // Clear current chat and prepare for new one
    setCurrentChatId(null);
    setMessages([]);
    setUploadedPreview(null);
    setSelectedTools([]);
    setIsSidebarOpen(false);
  }

  async function handleSelectChat(chatId) {
    if (chatId === currentChatId) {
      setIsSidebarOpen(false);
      return;
    }
    
    await loadChatMessages(chatId);
    setUploadedPreview(null);
    setSelectedTools([]);
    setIsSidebarOpen(false);
  }

  function openDeleteModal(chatId) {
    setDeleteModal({ open: true, chatId });
  }

  function closeDeleteModal() {
    setDeleteModal({ open: false, chatId: null });
  }

  async function confirmDeleteChat() {
    const chatId = deleteModal.chatId;
    
    try {
      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove chat from list
        const updatedChats = chats.filter((c) => c.id !== chatId);
        setChats(updatedChats);
        
        if (currentChatId === chatId) {
          // If deleted current chat, switch to first available or clear
          if (updatedChats.length > 0) {
            await loadChatMessages(updatedChats[0].id);
          } else {
            setCurrentChatId(null);
            setMessages([]);
          }
        }
      } else {
        errorToast('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      errorToast('An error occurred while deleting the chat.');
    }
    
    closeDeleteModal();
  }

  return (
    // FIX 1: Replaced h-screen with h-[100dvh] for accurate viewport height on mobile.
    <div className="h-[100dvh] bg-gray-50 flex relative overflow-hidden">
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
                  <span className="text-sm text-gray-800 font-medium truncate">{chat.title || 'New Chat'}</span>
                  <div className="text-xs text-gray-500 truncate mt-1">{chat.lastMessage}</div>
                </div>
                <button
                  className="ml-2 p-1 rounded md:hover:bg-gray-200 text-gray-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
        
        {/* Initial Loading Screen */}
        {isProcessingInitialMessage && messages.length === 1 && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full mx-auto animate-spin border-t-transparent"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Setting up your chat...</h2>
              <p className="text-gray-600 mb-4">BharatAI is processing your message and preparing a response.</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

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
              {userAvatar || session?.user?.image ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors bg-gray-100">
                  <img
                    src={userAvatar || session.user.image}
                    alt={session.user.name || "User"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    key={userAvatar} // Force re-render when avatar changes
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
          {(() => {
            // Deduplicate messages by ID - keep the last occurrence
            const uniqueMessages = [];
            const seenIds = new Set();
            
            // Iterate in reverse to keep the most recent version of each message
            for (let i = messages.length - 1; i >= 0; i--) {
              const msg = messages[i];
              if (!seenIds.has(msg.id)) {
                seenIds.add(msg.id);
                uniqueMessages.unshift(msg);
              }
            }
            
            return uniqueMessages.map((m) => (
              <div key={m.id} className="animate-fadeIn">
                <ChatMessage 
                  msg={{
                    role: m.role,
                    text: m.content,
                    image: m.image, // Pass full image object instead of just URL
                    id: m.id
                  }} 
                  onImageClick={handleImageClick}
                />
              </div>
            ));
          })()}
          
          {/* Typing Animation */}
          {isTyping && (
            <div ref={typingRef} className="animate-fadeIn">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 ai-avatar-typing flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl px-4 py-4 shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full typing-dot"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">BharatAI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tools and Upload Preview */}
        <div className="px-4 sm:px-6 flex-shrink-0 pb-2">
          <ToolSelector
            selected={isImageGenMode ? ["image-gen"] : selectedTools}
            onToggle={toggleTool}
            onUploadClick={handleUploadClick}
            onRemove={removeTool}
            onExitImageGen={exitImageGenMode}
          />

          {/* Image Generation Mode Indicator */}
          {isImageGenMode && (
            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-700">
                    🎨 Image Generation Mode Active
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Type your image description in the message box below
              </p>
            </div>
          )}

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

        {/* FIX 2: REFACTORED INPUT AREA */}
        {/* This entire block is updated for reliable positioning and a unified UI. */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
            <div className="px-4 sm:px-6 py-2 sm:py-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:pb-3">
                <div className="flex items-end gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey && !isTyping) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                onFocus={(e) => {
                                    // Smooth scroll into view for mobile keyboard
                                    if (window.innerWidth < 640) {
                                        setTimeout(() => {
                                            e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                        }, 300);
                                    }
                                }}
                                disabled={isTyping}
                                placeholder={
                                  isTyping 
                                    ? "AI is responding..." 
                                    : isImageGenMode 
                                      ? "🎨 Describe the image you want to generate..."
                                      : "Message Bharat AI..."
                                }
                                rows={1}
                                className={`w-full border-0 bg-transparent px-4 py-3 focus:outline-none resize-none text-gray-800 placeholder-gray-500 ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{
                                    minHeight: '48px',
                                    maxHeight: '150px',
                                }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={(!message.trim() && !uploadedPreview) || isTyping}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group flex-shrink-0"
                        title={
                            isTyping 
                                ? "AI is responding..." 
                                : isImageGenMode 
                                    ? "Generate image"
                                    : "Send message"
                        }
                    >
                        {isTyping ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isImageGenMode ? (
                            <div className="flex items-center gap-1">
                                <span className="text-sm">🎨</span>
                            </div>
                        ) : (
                            <FiSend size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        )}
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

      {/* Image Modal */}
      {console.log('Modal state:', imageModal)}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
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