import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { ChatMessage } from '../../types';
import Button from '../UI/Button';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Hi! I'm your AI assistant. I can help you find milestones, track your progress, and guide you through the community impact program. What would you like to know?",
    sender: 'ai',
    timestamp: new Date(),
    type: 'text',
    actions: [
      { id: '1', label: 'Find Milestones', action: 'find_milestones' },
      { id: '2', label: 'Check Progress', action: 'check_progress' },
      { id: '3', label: 'Connect Wallet', action: 'connect_wallet' }
    ]
  }
];

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('milestone') || lowerInput.includes('goal')) {
      return "I found several available milestones for you! The 'Organize Community Clean-up' milestone offers 150 IMPACT tokens and matches your environmental interests. Would you like me to help you get started with this one?";
    } else if (lowerInput.includes('progress') || lowerInput.includes('status')) {
      return "Great question! You're currently at 2,850 impact points with 12 completed milestones. You're 75% complete on the Community Clean-up milestone and 30% on the Youth Mentoring program. Keep up the excellent work!";
    } else if (lowerInput.includes('wallet') || lowerInput.includes('connect')) {
      return "I can help you connect your wallet! Click the wallet icon in the top navigation to connect your MetaMask or WalletConnect wallet. This will enable you to receive your IMPACT token rewards directly.";
    } else if (lowerInput.includes('reward') || lowerInput.includes('token')) {
      return "You've earned 1,420 IMPACT tokens so far! These tokens are automatically sent to your connected wallet when milestones are verified. Your pending rewards total 250 tokens from recent submissions.";
    } else {
      return "I'm here to help with your community impact journey! You can ask me about finding milestones, checking your progress, connecting your wallet, or understanding how rewards work. What specific area would you like to explore?";
    }
  };

  const handleActionClick = (action: string) => {
    const actionMessages = {
      find_milestones: "Here are some recommended milestones based on your interests and location. The Community Clean-up and Food Bank Volunteer opportunities are perfect for getting started!",
      check_progress: "You're doing amazing! You've completed 12 milestones and earned 1,420 IMPACT tokens. Your community rank is #23 out of 500+ participants.",
      connect_wallet: "To connect your wallet, click the wallet icon in the header and follow the prompts. This will enable automatic reward distribution!"
    };

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      content: actionMessages[action as keyof typeof actionMessages] || "I can help you with that!",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 500 
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm border'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.actions && (
                          <div className="mt-2 space-y-1">
                            {message.actions.map((action) => (
                              <button
                                key={action.id}
                                onClick={() => handleActionClick(action.action)}
                                className="block w-full text-left text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 shadow-sm border px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}