import type { MDXComponents } from "mdx/types";
import React from "react";
import dynamic from "next/dynamic";

// Dynamic imports to prevent webpack commons extraction issues
// All MDX components registered globally - no explicit imports needed in .mdx files
const InfoBox = dynamic(() => import("@/components/mdx/InfoBox"));
const MicroQuizMDX = dynamic(() => import("@/components/mdx/MicroQuizMDX"));
const MicroSection = dynamic(() => import("@/components/mdx/MicroSection"));
const MiniProject = dynamic(() => import("@/components/mdx/MiniProject"));
const ModuleTransition = dynamic(() => import("@/components/mdx/ModuleTransition"));
const PracticeButton = dynamic(() => import("@/components/mdx/PracticeButton"));
const QueryPlayground = dynamic(() => import("@/components/mdx/QueryPlayground"));

function Anchor(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href || "";
  const isExternal = /^https?:\/\//i.test(href);
  const rel = isExternal ? "noopener noreferrer" : props.rel;
  const target = isExternal ? "_blank" : props.target;
  return <a {...props} rel={rel} target={target} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: Anchor,
    InfoBox,
    MicroQuizMDX,
    MicroSection,
    MiniProject,
    ModuleTransition,
    PracticeButton,
    QueryPlayground,
  };
}
