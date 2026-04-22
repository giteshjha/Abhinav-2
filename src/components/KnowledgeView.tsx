import { BookOpen, Brain, Image as ImageIcon, Zap, PenLine, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function KnowledgeView() {
  const sections = [
    {
      id: 'llms',
      icon: <Brain className="text-primary" size={24} />,
      title: "The Digital Mind",
      subtitle: "UNDERSTANDING LARGE LANGUAGE MODELS",
      content: "Large Language Models (LLMs) like Gemini are built on 'Transformers'—architectures that predict the next most likely piece of text (a token) based on everything that came before it. They don't 'know' things in a human sense; instead, they have learned the complex statistical relationships between billions of words across the internet.",
      detail: "When you chat with Modern Prince, it uses these patterns to generate polite, context-aware responses that simulate reasoning and creativity."
    },
    {
      id: 'diffusion',
      icon: <ImageIcon className="text-primary" size={24} />,
      title: "Paint with Pixels",
      subtitle: "HOW IMAGE GENERATION WORKS",
      content: "Modern image generators use a process called 'Diffusion.' Imagine taking a clear photo and slowly adding 'static' or noise until it's just a gray blur. The AI is trained to do the opposite: it starts with pure noise and 'denoises' it step by step, guided by your text description, until a clear image emerges.",
      detail: "The model understands concepts like 'majestic', 'golden', and 'lion' as visual high-dimensional vectors, mapping your words to specific pixel patterns."
    },
    {
      id: 'prompting',
      icon: <PenLine className="text-primary" size={24} />,
      title: "The Modern Scribe",
      subtitle: "MASTERING PROMPT ENGINEERING",
      content: "Prompt engineering is the art of providing clear, descriptive, and stylistic instructions to the AI. A good prompt usually includes: \n\n1. Core Subject (A lion)\n2. Action/Mood (Majestic mane, golden glow)\n3. Medium (Oil painting, 8k photo)\n4. Lighting/Environment (Dawn light, savanna background)",
      detail: "Use the 'Magic Refine' tool in the Design section to see how Modern Prince can automatically expand a simple idea into a professional prompt."
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-primary/5 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-primary italic font-serif">Kingdom of Knowledge</h1>
          <p className="text-sm text-primary/40">Expanding your era through understanding</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <BookOpen size={20} />
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-12 space-y-20">
        <section className="text-center space-y-6 py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 rounded-full bg-primary/5 border border-primary/10 mb-2"
          >
            <Cpu size={32} className="text-primary" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85] text-primary"
          >
            The New <br /> Modern Era
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm uppercase tracking-[0.3em] font-bold text-primary/40"
          >
            A Guide to Generative Sovereignty
          </motion.p>
        </section>

        <div className="grid grid-cols-1 gap-16 pb-20">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {section.icon}
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-primary/40 uppercase">{section.subtitle}</p>
                    <h3 className="text-3xl font-black tracking-tight text-primary uppercase">{section.title}</h3>
                  </div>
                  <p className="text-lg leading-relaxed text-primary/80 font-medium">
                    {section.content}
                  </p>
                  <div className="p-4 rounded-2xl bg-primary/5 border-l-4 border-primary/20 italic text-sm text-primary/60 leading-relaxed">
                    {section.detail}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="py-20 border-t border-primary/10 text-center space-y-6">
          <Zap className="mx-auto text-primary/20" size={32} />
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-primary/30">
            Infinite Learning • High Fidelity • Royal Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}
