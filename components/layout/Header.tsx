import React from "react";
import { Download, Moon, Sun, Trash2 } from "lucide-react";
import { RLM } from "../../config";

interface HeaderProps {
    isInstallable: boolean;
    handleInstallClick: () => void;
    handleClearChat: () => void;
    confirmClear: boolean;
    darkMode: boolean;
    setDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
    isInstallable,
    handleInstallClick,
    handleClearChat,
    confirmClear,
    darkMode,
    setDarkMode,
}) => (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-bio-400 to-bio-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden">
                <img
                    src="https://img.icons8.com/fluency/512/biotech.png"
                    alt="BIOבוט"
                    className="w-10 h-10 object-contain filter drop-shadow-md"
                />
            </div>
            <div>
                <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                    {RLM}BIOבוט
                </h1>
                <div className="flex flex-col leading-none mt-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5 flex gap-1">
                        מבית{" "}
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
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">התקן אפליקציה</span>
                </button>
            )}
            <button
                onClick={handleClearChat}
                className={`p-2 rounded-full transition-all duration-300 flex items-center gap-1 ${
                    confirmClear
                        ? "bg-red-100 text-red-600 w-auto px-3"
                        : "hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                }`}
            >
                {confirmClear
                    ? (
                        <>
                            <span className="text-xs font-bold whitespace-nowrap">
                                מחק?
                            </span>
                            <Trash2 className="w-4 h-4" />
                        </>
                    )
                    : <Trash2 className="w-5 h-5" />}
            </button>
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {darkMode
                    ? <Sun className="w-5 h-5 text-yellow-400" />
                    : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
        </div>
    </header>
);
