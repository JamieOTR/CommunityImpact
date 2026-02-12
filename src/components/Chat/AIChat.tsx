import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Minimize2, Volume2 } from 'lucide-react';
import { ChatMessage } from '../../types';
import Button from '../UI/Button';
import VoiceInput from './VoiceInput';
import { aiService } from '../../lib/aiService';
import { useAuth } from '../../hooks/useAuth';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Hi! I'm your AI assistant. I can help you find milestones, track your progress, submit achievements via voice, and guide you through the community impact program. What would you like to know?",
    sender: 'ai',
    timestamp: new Date(),
    type: 'text',
    actions: [
      { id: '1', label: 'Find Milestones', action: 'find_milestones' },
      { id: '2', label: 'Check Progress', action: 'check_progress' },
      { id: '3', label: 'Voice Submission', action: 'voice_help' }
    ]
  }
];

export default function AIChat() {
  const { user } = useAuth();
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

  const handleSendMessage = async (messageText?: string, isVoice = false) => {
    const text = messageText || inputValue;
    if (!text.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      type: isVoice ? 'voice' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiService.processMessage(user.user_id, text);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        actions: response.suggestions?.map((suggestion, index) => ({
          id: `suggestion-${index}`,
          label: suggestion,
          action: suggestion.toLowerCase().replace(/\s+/g, '_')
        }))
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceMessage = (transcription: string, isVoice: boolean) => {
    handleSendMessage(transcription, isVoice);
  };

  const handleActionClick = async (action: string) => {
    if (!user) return;

    const actionMessages = {
      find_milestones: "Here are some recommended milestones based on your interests and location. The Community Clean-up and Food Bank Volunteer opportunities are perfect for getting started!",
      check_progress: `You're doing amazing! You've completed milestones and earned ${user.token_balance} IMPACT tokens. Your community impact score is ${user.total_impact_score}.`,
      voice_help: "You can use voice input to quickly submit milestone completions! Just click the microphone button and say something like 'I completed the community clean-up milestone' and I'll help you submit it with proper verification.",
      connect_wallet: "To connect your wallet, click the wallet icon in the header and follow the prompts. This will enable automatic reward distribution!",
      show_environmental_milestones: "I found environmental milestones available in your area! These include tree planting, beach cleanups, and sustainable living challenges.",
      view_detailed_progress: "Your detailed progress shows consistent growth across all impact areas. You're particularly strong in environmental and education categories."
    };

    const responseText = actionMessages[action as keyof typeof actionMessages] || "I can help you with that! What specific information would you like?";
    
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      content: responseText,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const speakMessage = async (message: string) => {
    try {
      await aiService.generateSpeechResponse(message);
    } catch (error) {
      console.error('Failed to speak message:', error);
    }
  };

  if (!user) {
    return null; // Don't show chat if user is not loaded
  }

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
                  <p className="text-xs text-white/80">Voice & text support</p>
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
                        <div className="flex items-start justify-between">
                          <p className="text-sm flex-1">{message.content}</p>
                          {message.sender === 'ai' && (
                            <button
                              onClick={() => speakMessage(message.content)}
                              className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                              title="Speak message"
                            >
                              <Volume2 className="w-3 h-3 text-gray-500" />
                            </button>
                          )}
                        </div>
                        
                        {message.type === 'voice' && (
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600">Voice message</span>
                          </div>
                        )}
                        
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
                      placeholder="Ask me anything or use voice..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <VoiceInput 
                      onVoiceMessage={handleVoiceMessage}
                      userId={user.user_id}
                    />
                    <Button
                      onClick={() => handleSendMessage()}
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