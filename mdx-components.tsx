import type { MDXComponents } from 'mdx/types'
import PracticeButton from '@/components/mdx/PracticeButton'
import InfoBox from '@/components/mdx/InfoBox'
import QueryPlayground from '@/components/mdx/QueryPlayground'
import SkillGate from '@/components/mdx/SkillGate'
import MiniProject from '@/components/mdx/MiniProject'
import ModuleTransition from '@/components/mdx/ModuleTransition'
import React from 'react'

function Anchor(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href || ''
  const isExternal = /^https?:\/\//i.test(href)
  const rel = isExternal ? 'noopener noreferrer' : props.rel
  const target = isExternal ? '_blank' : props.target
  return <a {...props} rel={rel} target={target} />
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: Anchor,
    PracticeButton,
    InfoBox,
    QueryPlayground,
    SkillGate,
    MiniProject,
    ModuleTransition,
  }
}
