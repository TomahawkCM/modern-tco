import type { MDXComponents } from "mdx/types";
import React from "react";

// Direct imports required for MDX - dynamic imports don't work with useMDXComponents
// All MDX components registered globally - no explicit imports needed in .mdx files
import InfoBox from "@/components/mdx/InfoBox";
import MicroQuizMDX from "@/components/mdx/MicroQuizMDX";
import MicroSection from "@/components/mdx/MicroSection";
import MiniProject from "@/components/mdx/MiniProject";
import ModuleTransition from "@/components/mdx/ModuleTransition";
import PracticeButton from "@/components/mdx/PracticeButton";
import QueryPlayground from "@/components/mdx/QueryPlayground";
import SkillGate from "@/components/mdx/SkillGate";

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
    SkillGate,
  };
}
