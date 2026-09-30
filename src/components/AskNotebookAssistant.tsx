import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, BookOpen, Lightbulb } from 'lucide-react';
import { Notebook } from '../types';

interface AskNotebookAssistantProps {
  notebook: Notebook;
}

export const AskNotebookAssistant: React.FC<AskNotebookAssistantProps> = ({ notebook }) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string }[]
  >([
    {
      role: 'assistant',
      text: `Hello! I'm Lumina, your AI study companion for **"${notebook.title}"**.\n\nI can answer questions grounded in your **${notebook.highlights.length} saved highlights**, synthesize your **re-read notes**, or connect concepts to the **author's historical context**. What would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    `Summarize the key takeaways from my highlights`,
    `What are my "Orange" (Re-read) notes and how do I understand them?`,
    `How does the author's historical era influence this book's thesis?`,
    `Give me an active recall question based on my saved quotes`,
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          notebookTitle: notebook.title,
          author: notebook.author,
          highlights: notebook.highlights,
          contextData: notebook.historicalContext,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to answer');
      }

      const botMsg = {
        role: 'assistant' as const,
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Ask notebook error:', err);
      const errorMsg = {
        role: 'assistant' as const,
        text: `Sorry, I encountered an issue retrieving an answer: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E6E1D8] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-[600px] text-[#4A443F]">
      {/* Header */}
      <div className="pb-3 border-b border-[#E6E1D8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#C86D51]/10 rounded-lg border border-[#C86D51]/20 text-[#C86D51]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#2D2A26]">
              Lumina AI Reading & Study Assistant
            </h3>
            <p className="text-[11px] text-[#78716A]">
              Grounded directly in "{notebook.title}" notes & highlights
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#FAF9F6] text-[#A85138] border border-[#E6E1D8]">
          {notebook.highlights.length} Highlights Indexed
        </span>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-[#C86D51] text-white'
                  : 'bg-[#8F7285]/20 text-[#8F7285] border border-[#8F7285]/30'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-[#C86D51] text-white font-medium'
                  : 'bg-[#FAF9F6] border border-[#E6E1D8] text-[#2D2A26]'
              }`}
            >
              <p className="whitespace-pre-line font-sans">{msg.text}</p>
              <span
                className={`block text-[9px] mt-1 text-right font-mono ${
                  msg.role === 'user' ? 'text-white/80' : 'text-[#78716A]'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#8F7285]/20 text-[#8F7285] border border-[#8F7285]/30 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl text-xs text-[#78716A] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C86D51]" />
              <span>Analyzing notebook memory and formulating answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="pt-2 pb-3 border-t border-[#E6E1D8]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] hover:text-[#2D2A26] border border-[#E6E1D8] whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3 text-[#C86D51]" />
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[#E6E1D8]"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about this book's quotes, author, or topics..."
          className="flex-1 px-4 py-2.5 bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl text-xs sm:text-sm text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="p-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
