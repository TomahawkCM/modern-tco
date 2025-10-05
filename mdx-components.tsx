import type { MDXComponents } from 'mdx/types'
import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports to prevent webpack commons extraction issues
const MicroQuizMDX = dynamic(() => import('@/components/mdx/MicroQuizMDX'))
const PracticeButton = dynamic(() => import('@/components/mdx/PracticeButton'))

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
    MicroQuizMDX,
    PracticeButton,
  }
}
