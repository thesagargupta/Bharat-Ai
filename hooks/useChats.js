"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useChats() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/chats');
          if (response.ok) {
            const data = await response.json();
            setChats(data.chats);
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

  return { chats, setChats, isLoadingChats };
}
