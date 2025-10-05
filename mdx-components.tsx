import type { MDXComponents } from 'mdx/types'
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
    // Only HTML element overrides - custom components use explicit imports in MDX files
  }
}
