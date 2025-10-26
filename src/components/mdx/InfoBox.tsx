import React from 'react';

type InfoBoxProps = {
    title?: string;
    children?: React.ReactNode;
};

export default function InfoBox({ title, children }: InfoBoxProps) {
    return (
        <aside className="rounded-md border border-gray-200 bg-gray-50 p-4">
            {title && <div className="mb-2 font-semibold">{title}</div>}
            <div>{children}</div>
        </aside>
    );
}
