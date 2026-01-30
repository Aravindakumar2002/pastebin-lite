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
            style={{ padding: '6px 12px', fontSize: '13px' }}
        >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
    );
}
