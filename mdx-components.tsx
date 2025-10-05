import type { MDXComponents } from 'mdx/types'
import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports prevent webpack commons chunk extraction
const MicroQuizMDX = dynamic(() => import('@/components/mdx/MicroQuizMDX'))
const InfoBox = dynamic(() => import('@/components/mdx/InfoBox'))
const PracticeButton = dynamic(() => import('@/components/mdx/PracticeButton'))
const QueryPlayground = dynamic(() => import('@/components/mdx/QueryPlayground'))
const MicroSection = dynamic(() => import('@/components/mdx/MicroSection'))
const ModuleTransition = dynamic(() => import('@/components/mdx/ModuleTransition'))

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
    // Custom components - dynamically imported to prevent webpack commons extraction
    MicroQuizMDX,
    InfoBox,
    PracticeButton,
    QueryPlayground,
    MicroSection,
    ModuleTransition,
  }
}
