
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { createDoubtSolverChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { SendIcon, SparklesIcon, UserCircleIcon } from '../components/icons/Icons';

const DoubtSolver: React.FC = () => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Initialize chat session on component mount
        const session = createDoubtSolverChat();
        setChatSession(session);
        setMessages([
            { sender: 'ai', text: "Hey there! 🚀 I'm PrepAI, your personal AI tutor. Got a tricky question from Physics, Chemistry, Math, or Biology? Ask away, and let's solve it together! ✨" }
        ]);
    }, []);
    
    useEffect(scrollToBottom, [messages]);
    
    const sendMessage = useCallback(async () => {
        if (!userInput.trim() || !chatSession || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const stream = await chatSession.sendMessageStream({ message: userInput });
            
            let aiResponseText = '';
            setMessages(prev => [...prev, { sender: 'ai', text: '' }]); // Add placeholder for AI response

            for await (const chunk of stream) {
                const c = chunk as GenerateContentResponse;
                aiResponseText += c.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = aiResponseText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Oh no! 😥 Something went wrong on my end. Please try asking again." }]);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, chatSession, isLoading]);
    
    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-md border border-slate-200">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold font-serif text-charcoal">AI Doubt Solver</h2>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-cream-100">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-10 h-10 flex-shrink-0 bg-primary-800 text-white rounded-full flex items-center justify-center shadow-sm">
                                <SparklesIcon className="w-6 h-6"/>
                            </div>
                        )}
                        <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${msg.sender === 'ai' ? 'bg-white border text-charcoal' : 'bg-primary-700 text-white'}`}>
                           <MarkdownRenderer content={msg.text} isChat={true} />
                        </div>
                        {msg.sender === 'user' && (
                             <div className="w-10 h-10 flex-shrink-0 bg-slate-300 text-white rounded-full flex items-center justify-center shadow-sm">
                                <UserCircleIcon className="w-8 h-8"/>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 flex-shrink-0 bg-primary-800 text-white rounded-full flex items-center justify-center shadow-sm">
                             <SparklesIcon className="w-6 h-6"/>
                        </div>
                        <div className="max-w-xl p-4 rounded-2xl bg-white border flex items-center space-x-2 shadow-sm">
                           <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                <div className="relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me anything about your subjects..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent text-white rounded-full disabled:bg-slate-400 hover:bg-accent-600 transition-colors"
                    >
                        <SendIcon/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoubtSolver;
