'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import * as mdx from '@mdx-js/react';
import * as runtime from 'react/jsx-runtime';

export interface MDXRemoteClientProps extends MDXRemoteSerializeResult {
  components?: Parameters<typeof mdx.MDXProvider>[0]['components'];
  lazy?: boolean;
}

function getJsxRuntime() {
  const base = runtime as unknown as Record<string, any>;
  return {
    Fragment: base.Fragment,
    jsx: base.jsx,
    jsxs: base.jsxs,
    jsxDEV: base.jsxDEV ?? base.jsx,
  };
}

export function MDXRemoteClient({
  compiledSource,
  frontmatter,
  scope,
  components = {},
  lazy,
}: MDXRemoteClientProps) {
  const [isReadyToRender, setIsReadyToRender] = useState(!lazy || typeof window === 'undefined');

  useEffect(() => {
    if (!lazy) return;
    if (typeof window === 'undefined') {
      setIsReadyToRender(true);
      return;
    }
    const schedule = 'requestIdleCallback' in window
      ? window.requestIdleCallback(() => setIsReadyToRender(true))
      : window.setTimeout(() => setIsReadyToRender(true), 50);
    return () => {
      if (typeof schedule === 'number') {
        window.clearTimeout(schedule);
      } else if (schedule) {
        window.cancelIdleCallback?.(schedule);
      }
    };
  }, [lazy]);

  const Content = useMemo(() => {
    const jsxRuntime = getJsxRuntime();
    const fullScope = Object.assign({ opts: { ...mdx, ...jsxRuntime } }, { frontmatter }, scope);
    const keys = Object.keys(fullScope);
    const values = Object.values(fullScope);
    const hydrateFn = Reflect.construct(Function, keys.concat(compiledSource));
    return hydrateFn.apply(hydrateFn, values).default;
  }, [scope, compiledSource, frontmatter]);

  if (!isReadyToRender) {
    return <div dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning />;
  }

  const content = (
    <mdx.MDXProvider components={components}>
      <Content />
    </mdx.MDXProvider>
  );

  return lazy ? <div>{content}</div> : content;
}
