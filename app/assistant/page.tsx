'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { getAssistantResponse } from '@/lib/assistant';
import { ChatMessage } from '@/types';
import { Card } from '@/components/ui';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { generateId } from '@/lib/storage';

const SUGGESTED = [
  'Which campaign had the highest open rate?',
  'How many emails were clicked this month?',
  'Which campaign generated the most conversions?',
  'What is my average click-through rate?',
  'How are my campaigns performing?',
  'Summarize the most recent campaign.',
  'Which campaigns should I review?',
  'How many total emails have been sent?',
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your AI Campaign Assistant. I can answer questions about your campaign data — open rates, clicks, conversions, and more. What would you like to know?",
  timestamp: new Date().toISOString(),
};

function renderMarkdown(text: string): React.ReactNode {
  // Simple bold (**text**) and newline rendering
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part === '\n') return <br key={i} />;
    return part;
  });
}

export default function AssistantPage() {
  const { state } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate slight delay for realism
    setTimeout(() => {
      const response = getAssistantResponse(text.trim(), state.campaigns);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 400);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Campaign Assistant</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Analyzing {state.campaigns.length} campaign{state.campaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-indigo-600'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}>
                {renderMarkdown(msg.content)}
                <div className={`text-xs mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.slice(0, 4).map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about your campaigns..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </Card>

      {/* Suggested questions (full list) */}
      {messages.length > 2 && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
