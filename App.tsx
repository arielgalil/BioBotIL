import React, { useState, useRef, useEffect } from 'react';
import { Send, Moon, Sun, X, Sparkles, Trash2, Download } from 'lucide-react';
import { Message, Sender, WidgetType, WidgetData } from './types';
import { MessageBubble } from './components/MessageBubble';
import { streamChatResponse, generateWidgets } from './services/geminiService';
import { usePWAInstall } from './hooks/usePWAInstall';

const API_KEY = process.env.API_KEY || ""; 
const RLM = "\u200f"; // Right-to-Left Mark

// --- Question Repository ---
const QUESTION_POOL = [
  // גוף האדם ופיזיולוגיה (Human Body & Physiology) 🫀
  { icon: "🫀", text: "איך פועל הלב?" },
  { icon: "🧠", text: "איך המוח שומר זיכרונות?" },
  { icon: "🦴", text: "למה השרירים כואבים אחרי אימון?" },
  { icon: "🩸", text: "איך פועלת מערכת החיסון?" },
  { icon: "👀", text: "איך העין רואה צבעים?" },
  { icon: "🤒", text: "למה יש לנו חום כשאנחנו חולים?" },
  { icon: "💤", text: "למה אנחנו צריכים לישון?" },
  { icon: "🍏", text: "מה קורה לאוכל בקיבה?" },
  { icon: "💪", text: "איך שרירים נבנים?" },
  { icon: "👂", text: "איך אנחנו שומעים?" },
  { icon: "💭", text: "מה קורה במוח כשאנחנו חולמים?" },
  { icon: "🥱", text: "למה אנחנו מפהקים?" },
  { icon: "🌶️", text: "למה פלפל חריף שורף בפה?" },
  { icon: "🅰️", text: "למה יש סוגי דם שונים?" },
  { icon: "⚡", text: "מה זה אדרנלין ומה הוא עושה לגוף?" },
  { icon: "🤕", text: "איך הגוף מרפא פצעים?" },

  // התא וגנטיקה (Cell & Genetics) 🦠
  { icon: "🦠", text: "מה ההבדל בין תא צמח לתא אנימלי?" },
  { icon: "🔋", text: "מה תפקיד המיטוכונדריה?" },
  { icon: "🧬", text: "איך ה-DNA משוכפל?" },
  { icon: "🛡️", text: "מה תפקיד קרום התא?" },
  { icon: "🦠", text: "מה ההבדל בין חיידק לוירוס?" },
  { icon: "☀️", text: "מהי פוטוסינתזה?" },
  { icon: "🏗️", text: "מה זה ריבוזום?" },
  { icon: "➗", text: "מה קורה במיטוזה?" },
  { icon: "✉️", text: "איך תאים מתקשרים זה עם זה?" },
  { icon: "🧪", text: "מה הם אנזימים?" },
  { icon: "👯", text: "האם אפשר לשבט בני אדם?" },
  { icon: "✂️", text: "מה זה CRISPR?" },

  // אבולוציה (Evolution) 🦖
  { icon: "🦒", text: "למה לג'ירפה יש צוואר ארוך?" },
  { icon: "🦍", text: "האם בני האדם עדיין עוברים אבולוציה?" },
  { icon: "🦕", text: "למה הדינוזאורים נכחדו?" },
  { icon: "🦎", text: "איך נוצרים מינים חדשים בטבע?" },
  { icon: "🐟", text: "איך דגים התחילו ללכת על היבשה?" },
  { icon: "🦚", text: "למה לטווס יש זנב מפואר?" },

  // אקולוגיה וטבע (Ecology & Nature) 🌿
  { icon: "🍂", text: "למה עלים מחליפים צבע בשלכת?" },
  { icon: "🐝", text: "למה דבורים חשובות לטבע?" },
  { icon: "🔗", text: "מהי שרשרת מזון?" },
  { icon: "🤝", text: "מהי סימביוזה?" },
  { icon: "🌵", text: "איך חיות מסתגלות למדבר?" },
  { icon: "🌍", text: "מהו אפקט החממה?" },
  { icon: "🍄", text: "איך פטריות עוזרות ליער?" },
  { icon: "🐠", text: "למה השוניות מלבינות?" },
  { icon: "🦅", text: "איך ציפורים יודעות לאן לנדוד?" },
  { icon: "💡", text: "איך גחליליות מאירות?" },
  { icon: "🦗", text: "מה הנזק של מינים פולשים?" },

  // מחקר ורפואה (Research & Medicine) 🔬
  { icon: "💉", text: "איך מפתחים חיסון חדש?" },
  { icon: "💊", text: "מה זה פלצבו?" },
  { icon: "🧫", text: "איך גילו את האנטיביוטיקה?" },
  { icon: "🐁", text: "למה עושים ניסויים בעכברים?" },
  { icon: "🩸", text: "מה בדיקת דם יכולה לגלות?" },
  { icon: "🔎", text: "מה ההבדל בין תאוריה לעובדה?" },
  { icon: "🧪", text: "איך עובד ניסוי קליני?" },
  { icon: "🧲", text: "איך עובד MRI?" },
  { icon: "🐍", text: "מה ההבדל בין ארס לרעל?" }
];

function App() {
  const { isInstallable, handleInstallClick } = usePWAInstall();

  // -- Local Storage Init --
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('biobot_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('biobot_theme');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [replyContext, setReplyContext] = useState<{ id: string, text: string } | null>(null);
  const [suggestions, setSuggestions] = useState<{icon: string, text: string}[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedFromUrl = useRef(false);
  
  useEffect(() => {
    // Shuffle and pick 6 suggestions on mount
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    
    // Check for slug to refine suggestions
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && s !== 'index.html');
    
    if (segments.length > 0) {
        const slug = decodeURIComponent(segments[0]);
        // Simple relevance check: does the question contain words from the slug or vice versa
        const slugWords = slug.split(/[\s-]/).filter(w => w.length > 2);
        const related = QUESTION_POOL.filter(q => 
            slugWords.some(word => q.text.includes(word)) || q.text.includes(slug)
        );
        
        if (related.length >= 3) {
            // Mix related with some random ones for variety
            const finalSuggestions = [...related.slice(0, 4), ...shuffled.filter(s => !related.includes(s)).slice(0, 2)];
            setSuggestions(finalSuggestions.sort(() => 0.5 - Math.random()));
        } else {
            setSuggestions(shuffled.slice(0, 6));
        }
        
        // Update Title
        document.title = `${RLM}BIOבוט - ${slug}`;
    } else {
        setSuggestions(shuffled.slice(0, 6));
        document.title = `${RLM}BIOבוט`;
    }
  }, []);

  // -- Persistence Effects --
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('biobot_theme', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('biobot_messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleClearChat = () => {
    if (confirmClear) {
      setMessages([]);
      localStorage.removeItem('biobot_messages');
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Auto reset after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    if (!API_KEY) {
        alert("Please provide a Gemini API Key in the code or environment.");
        return;
    }

    // Capture context
    const currentContext = replyContext; 
    const isContextReply = !!currentContext;
    
    // Visual Message for the UI
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      content: text,
      quotedContent: currentContext?.text || undefined,
      relatedMessageId: currentContext?.id || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setReplyContext(null);
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      sender: Sender.Bot,
      content: '',
      isStreaming: true,
      timestamp: Date.now()
    }]);

    // Prompt logic
    const promptToSend = currentContext ? `[בהקשר ל: ${currentContext.text}] ${text}` : text;

    try {
      let accumulatedText = "";
      
      // OPTIMIZATION 3: Context Pruning
      // We slice the messages to keep only the last 12 items (approx) to save tokens and avoid context limits
      const history = messages.slice(-12).map(m => ({
          role: m.sender === Sender.User ? 'user' : 'model',
          parts: [{ text: m.quotedContent ? `[בהקשר ל: ${m.quotedContent}] ${m.content}` : m.content }]
      }));

      // OPTIMIZATION 1: Parallel Execution
      // Start widget generation immediately (background), do not await it yet.
      // We stagger it by 2 seconds to avoid hitting burst rate limits immediately with the text request
      let widgetPromise: Promise<WidgetData[]> = Promise.resolve([]);
      if (!isContextReply) {
         // Create a delayed promise for widgets
         widgetPromise = new Promise((resolve) => {
             setTimeout(() => {
                 generateWidgets(API_KEY, promptToSend).then(resolve);
             }, 2000); 
         });
      }

      // Start text streaming
      await streamChatResponse(
        API_KEY,
        history,
        promptToSend,
        (chunk) => {
          accumulatedText += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, content: accumulatedText } 
              : msg
          ));
        },
        isContextReply
      );

      // Mark text streaming as done immediately after text finishes
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));

      // Handle widgets arriving (possibly after text is done)
      if (!isContextReply) {
          widgetPromise.then(widgets => {
              if (widgets && widgets.length > 0) {
                  setMessages(prev => prev.map(msg => 
                      msg.id === botMsgId 
                      ? { ...msg, widgets: widgets } 
                      : msg
                  ));
              }
          }).catch(err => {
              // Widgets are optional, silent fail is okay here
              console.warn("Background widget generation failed (likely quota or parsing):", err);
          });
      }

    } catch (error: any) {
      // Check for Rate Limit / Quota
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');

      let userMessage = "\n\n(אירעה שגיאה בתקשורת. אנא נסה שוב)";

      if (isRateLimit) {
         // Do not log as error to avoid scary console overlays
         console.warn("Quota exceeded (429), alerting user.");
         userMessage = `

---
🛑 **הגענו למגבלת השימוש בחשבון החינמי**

המערכת משתמשת בשירות AI בחבילה חינמית, והגענו למכסת הבקשות לרגע זה.
אנא המתינו דקה או שתיים ונסו שוב. 

תודה על ההבנה!
`;
      } else {
         console.error(error);
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, isStreaming: false, content: msg.content + userMessage } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // -- URL Slug Initialization --
  useEffect(() => {
    if (initializedFromUrl.current) return;
    
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && s !== 'index.html');
    const params = new URLSearchParams(window.location.search);
    const queryText = params.get('q') || params.get('text');

    if (segments.length > 0 || queryText) {
      initializedFromUrl.current = true;
      
      const slug = segments.length > 0 ? decodeURIComponent(segments[0]) : '';
      const pathText = segments.slice(1).map(s => decodeURIComponent(s)).join(' ');
      const combinedText = pathText || queryText || '';
      
      const initialPrompt = combinedText 
        ? (slug ? `${slug}: ${combinedText}` : combinedText)
        : slug;
      
      if (initialPrompt && !messages.some(m => m.content === initialPrompt)) {
        // Short delay to ensure everything is mounted and ready
        setTimeout(() => {
          handleSend(initialPrompt);
        }, 800);
      }
    }
  }, [messages, handleSend]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-bio-400 to-bio-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden">
                <img 
                    src="https://img.icons8.com/fluency/512/biotech.png" 
                    alt="BIOבוט" 
                    className="w-10 h-10 object-contain filter drop-shadow-md" 
                />
            </div>
            <div>
                <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{RLM}BIOבוט</h1>
                <div className="flex flex-col leading-none mt-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5 flex gap-1">
                      מבית 
                      <a 
                        href="https://galilbio.wordpress.com"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-bio-600 dark:text-bio-400 hover:text-bio-700 dark:hover:text-bio-300 hover:underline transition-colors font-bold"
                      >
                        הביולוגים של גליל
                      </a>
                    </span>
                </div>
            </div>
        </div>
        <div className="flex gap-2 items-center">
            {isInstallable && (
              <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 px-3 py-2 bg-bio-100 dark:bg-bio-900/30 text-bio-700 dark:text-bio-400 rounded-full font-bold text-xs hover:bg-bio-200 dark:hover:bg-bio-900/50 transition-all animate-pulse shadow-sm"
                  title="התקן אפליקציה"
              >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">התקן אפליקציה</span>
              </button>
            )}
            <button 
                onClick={handleClearChat}
                className={`p-2 rounded-full transition-all duration-300 flex items-center gap-1 ${confirmClear ? 'bg-red-100 text-red-600 w-auto px-3' : 'hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500'}`}
                title="נקה היסטוריה"
            >
                {confirmClear ? (
                  <>
                     <span className="text-xs font-bold whitespace-nowrap">מחק?</span>
                     <Trash2 className="w-4 h-4" />
                  </>
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
            </button>
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="מצב לילה/יום"
            >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-gray-900 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in pt-20">
             <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">שלום! אני {RLM}BIOבוט.</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">אני כאן כדי לעזור לך להבין ביולוגיה בצורה כיפית. על מה נדבר היום?</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
                {suggestions.map((s, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSend(s.text)}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-bio-400 dark:hover:border-bio-500 hover:shadow-md transition-all text-right font-medium text-gray-700 dark:text-gray-200 group"
                    >
                        <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] transition-transform group-hover:scale-110">{s.icon}</span>
                        <span>{s.text}</span>
                    </button>
                ))}
             </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onReply={(text, id) => setReplyContext({ text, id })}
                onTopicClick={(topic) => handleSend(`ספר לי עוד על ${topic}`)}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 z-20">
        
        {replyContext && (
            <div className="flex items-center justify-between bg-bio-50 dark:bg-bio-900/20 p-3 px-4 rounded-t-xl text-sm border-l-4 border-bio-500 mb-2 animate-slide-up mx-2 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-xs text-bio-600 dark:text-bio-400 font-bold mb-0.5">משיב ל:</span>
                    <span className="text-gray-700 dark:text-gray-300 truncate font-medium max-w-xs">{replyContext.text}</span>
                </div>
                <button onClick={() => setReplyContext(null)} className="text-gray-400 hover:text-red-500 p-1">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <div className="relative flex-1">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="שאל אותי כל דבר על ביולוגיה..."
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-4 pr-4 pl-12 resize-none focus:outline-none focus:ring-2 focus:ring-bio-500 focus:bg-white dark:focus:bg-gray-900 transition-all shadow-inner"
                    rows={1}
                    style={{ minHeight: '3.5rem', maxHeight: '120px' }}
                />
            </div>
            
            <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-4 rounded-2xl bg-bio-600 hover:bg-bio-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white shadow-lg transition-all active:scale-90 flex items-center justify-center"
            >
                <Send className="w-6 h-6 transform -rotate-90" />
            </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-gray-400">
            {RLM}BIOבוט עשוי לעשות טעויות. בדוק מידע חשוב.
        </div>
      </footer>
    </div>
  );
}

export default App;