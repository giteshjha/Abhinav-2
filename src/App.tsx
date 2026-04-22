/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Image as ImageIcon, Film, Heart, BookOpen } from 'lucide-react';
import { AppMode } from './types';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import VideoView from './components/VideoView';
import KnowledgeView from './components/KnowledgeView';
import KeySelectionGuard from './components/KeySelectionGuard';

export default function App() {
  const [mode, setMode] = useState<AppMode>('chat');

  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'image', label: 'Design', icon: ImageIcon },
    { id: 'video', label: 'Motion', icon: Film },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 flex flex-col border-r border-primary/10 bg-white/40 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <Heart size={24} fill="currentColor" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">Modern Prince</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as AppMode)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                mode === item.id 
                  ? 'bg-primary text-secondary shadow-lg shadow-primary/20' 
                  : 'text-primary/60 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="hidden md:block p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/40 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Ready to assist</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {mode === 'chat' && <ChatView />}
            {mode === 'image' && <ImageView />}
            {mode === 'video' && <VideoView />}
            {mode === 'knowledge' && <KnowledgeView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
