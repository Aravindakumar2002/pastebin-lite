"use client";

import { useState } from 'react';

export default function SimpleCopyButton({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                width: 'auto',
                background: copied ? 'var(--accent)' : 'var(--primary)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
    );
}
