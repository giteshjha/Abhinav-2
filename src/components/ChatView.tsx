import { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';
import { generateChatResponse } from '../lib/gemini';

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Modern Prince, your polite and capable AI assistant. How can I brighten your day today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const geminiMessages = [...messages, userMessage].map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }]
      }));

      const response = await generateChatResponse(geminiMessages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "I apologize, but I encountered a small difficulty in formulating a response. Could you please try again?"
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: "I'm very sorry, but something went wrong. Please check your connection and try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Tell me a polite story about a robot.",
    "Help me write a kind thank-you note.",
    "What are some easy ways to practice mindfulness?",
    "Explain how a rainbow is formed simply."
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-primary/5 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">Safe & Polite Chat</h1>
          <p className="text-sm text-primary/40">Powered by Gemini Architecture</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-medium">
          <Sparkles size={14} className="animate-pulse" />
          Thinking Active
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
            >
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(text); }}
                  className="text-left p-4 rounded-2xl bg-white border border-primary/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-sm font-medium"
                >
                  {text}
                </button>
              ))}
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-primary text-secondary'
                }`}>
                  {message.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <div className="markdown-body">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary">
                <Sparkles size={16} className="animate-spin-slow" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm italic">Modern Prince is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto glass-panel p-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your kind request here..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-primary placeholder:text-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-primary/30 mt-4">
          Modern Prince AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
