"use client";

import ReactMarkdown from "react-markdown";

interface LabMarkdownProps {
  content: string;
}

export default function LabMarkdown({ content }: LabMarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
