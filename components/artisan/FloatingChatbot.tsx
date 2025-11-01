'use client';

import { useDynamicTranslation } from '@/lib/i18n/useDynamicTranslation';
import { MessageCircle, Mic, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { t, translateBatch, currentLocale } = useDynamicTranslation();

  // Pre-load translations
  useEffect(() => {
    translateBatch([
      "AI Assistant",
      "Always here to help",
      "Type your message...",
      "Start voice recording",
      "Stop recording",
      "Send message",
      "Processing your voice message...",
      "Sorry, I encountered an error. Please try again.",
      "Sorry, I could not process your voice message. Please try typing instead.",
      "Open chatbot",
      "Close chatbot",
      "Minimize",
      "Maximize",
      "Thinking...",
      "Namaste! I'm your AI assistant here to help you with your artisan business.",
      "I can help you with:",
      "Product Management",
      "Check your products, sales, and inventory",
      "Business Analytics",
      "View your sales, orders, and performance",
      "Financial Information",
      "Track earnings and payment details",
      "Order Management",
      "Check customer orders and their status",
      "General Questions",
      "Answer any questions about your business",
      "Feel free to ask me anything in your preferred language!",
    ]);
  }, [currentLocale, translateBatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message and update when language changes
  useEffect(() => {
    const welcomeText = `🙏 ${t("Namaste! I'm your AI assistant here to help you with your artisan business.")}

${t("I can help you with:")}
📦 **${t("Product Management")}** - ${t("Check your products, sales, and inventory")}
📊 **${t("Business Analytics")}** - ${t("View your sales, orders, and performance")}
💰 **${t("Financial Information")}** - ${t("Track earnings and payment details")}
📝 **${t("Order Management")}** - ${t("Check customer orders and their status")}
❓ **${t("General Questions")}** - ${t("Answer any questions about your business")}

${t("Feel free to ask me anything in your preferred language!")}`;

    const welcomeMessage: Message = {
      id: 'welcome-' + currentLocale,
      type: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, [currentLocale, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/artisan/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          message: inputValue,
          language: currentLocale,
          conversationHistory: messages.slice(-5).map((msg) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.content || 'I apologize, I could not process your request.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Format markdown text to HTML-like JSX
  const formatMessage = (text: string) => {
    // Split by lines to handle each line separately
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-base font-bold mt-3 mb-2 text-primary">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-lg font-bold mt-3 mb-2 text-primary">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-xl font-bold mt-3 mb-2 text-primary">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Handle bullet points
      if (line.match(/^[•\-\*]\s/)) {
        const content = line.replace(/^[•\-\*]\s/, '');
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-primary mt-1">•</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </div>
        );
      }

      // Handle numbered lists
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match) {
          return (
            <div key={lineIndex} className="flex items-start gap-2 my-1">
              <span className="text-primary font-semibold">{match[1]}.</span>
              <span className="flex-1">{formatInlineText(match[2])}</span>
            </div>
          );
        }
      }

      // Handle emoji lines (like 📦, 💰, etc.)
      if (line.match(/^[📦💰📊📝❓🎨🌍🎤💬🙏✨]/)) {
        return (
          <div key={lineIndex} className="my-2">
            {formatInlineText(line)}
          </div>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }

      // Regular paragraphs
      return (
        <p key={lineIndex} className="my-1">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Match **bold**, *italic*, `code`, and emojis
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|[📦💰📊📝❓🎨🌍🎤💬🙏✨🔔📱🎯🚀⚡️✅❌🌟💡🎉])/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      const matchedText = match[0];
      
      // Bold text **text**
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-primary">
            {matchedText.slice(2, -2)}
          </strong>
        );
      }
      // Italic text *text*
      else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-foreground/80">
            {matchedText.slice(1, -1)}
          </em>
        );
      }
      // Code text `code`
      else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        parts.push(
          <code key={match.index} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
            {matchedText.slice(1, -1)}
          </code>
        );
      }
      // Emoji
      else {
        parts.push(
          <span key={match.index} className="text-lg">
            {matchedText}
          </span>
        );
      }

      currentIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    // Add a loading message
    const loadingMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Processing your voice message...',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', currentLocale);

      const response = await fetch('/api/artisan/chatbot/voice', {
        method: 'POST',
        headers: {
          // No Content-Type header - browser sets it automatically for FormData
        },
        credentials: 'include', // Include cookies for authentication
        body: formData,
      });

      const data = await response.json();

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));

      if (data.success && data.transcription) {
        // Add transcribed message as user message
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: `🎤 ${data.transcription}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Add assistant response
        if (data.response) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        throw new Error(data.error || 'Failed to process voice');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I could not process your voice message. Please try typing instead.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 animate-bounce"
          aria-label={t("Open chatbot")}
        >
          <MessageCircle className="w-8 h-8 text-primary-foreground" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-card rounded-2xl shadow-2xl border border-border transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary/80 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-foreground text-sm">{t("AI Assistant")}</h3>
                <p className="text-xs text-primary-foreground/80">{t("Always here to help")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-primary-foreground hover:bg-primary/50 p-1.5 rounded-lg transition-colors"
                aria-label={isMinimized ? t("Maximize") : t("Minimize")}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary/50 p-1.5 rounded-lg transition-colors"
                aria-label={t("Close chatbot")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                          : 'bg-secondary text-foreground shadow-lg border border-border'
                      } ${message.isLoading ? 'animate-pulse' : ''}`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.type === 'user' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="space-y-1">{formatMessage(message.content)}</div>
                        )}
                      </div>
                      <span className="text-xs opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString(currentLocale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-foreground p-3 rounded-2xl flex items-center gap-2 shadow-lg border border-border">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">{t("Thinking...")}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-card backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`flex-shrink-0 p-3 rounded-xl transition-all shadow-md ${
                      isRecording
                        ? 'bg-destructive hover:bg-destructive/90 animate-pulse'
                        : 'bg-secondary hover:bg-secondary/80 border border-border'
                    } text-foreground`}
                    aria-label={isRecording ? t("Stop recording") : t("Start voice recording")}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("Type your message...")}
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                    disabled={isLoading || isRecording}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim() || isRecording}
                    className="flex-shrink-0 p-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
                    aria-label={t("Send message")}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.8);
        }
      `}</style>
    </>
  );
}
