"use client";
import React from "react";
import Image from "next/image";
import { FiUser, FiCpu } from "react-icons/fi";

export default function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
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

        <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
          <div
            className={`inline-block px-5 py-3 rounded-2xl break-words shadow-lg ${
              isUser
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
            }`}
          >
            {msg.text && <div className="text-sm leading-relaxed">{msg.text}</div>}
            {msg.image && (
              <div className="mt-3">
                <img
                  src={msg.image}
                  alt="attached"
                  className="w-full max-h-64 object-cover rounded-xl border shadow-sm"
                />
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