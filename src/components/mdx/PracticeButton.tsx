'use client';

import React from 'react';
import Link from 'next/link';

type PracticeButtonProps = {
    href?: string;
    children?: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    domain?: string;
    objectiveId?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
};

function cls(...parts: Array<string | undefined>) {
    return parts.filter(Boolean).join(' ');
}

export default function PracticeButton({
    href,
    children,
    className,
    variant = 'primary',
    domain,
    objectiveId,
    onClick
}: PracticeButtonProps) {
    const base =
        'inline-flex items-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants: Record<NonNullable<PracticeButtonProps['variant']>, string> = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
        outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-gray-400'
    };
    const classes = cls(base, variants[variant], className);

    const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
        if (onClick) {
            onClick(e);
            return;
        }
        // Fallback: dispatch a custom event for app-level handlers
        if (!href && typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('practice:open', {
                    detail: { domain, objectiveId }
                })
            );
        }
    };

    if (href) {
        return (
            <Link href={href} className={classes} onClick={handleClick}>
                {children ?? 'Practice'}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} onClick={handleClick}>
            {children ?? 'Practice'}
        </button>
    );
}
