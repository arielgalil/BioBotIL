import React from "react";

export const RichText: React.FC<{ text: string; className?: string }> = (
    { text, className },
) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    const style = className ||
                        "font-black text-bio-700 dark:text-bio-300";
                    return (
                        <strong key={i} className={style}>
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};
