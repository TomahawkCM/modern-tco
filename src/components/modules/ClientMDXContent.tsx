'use client'; // Ensure at top

export default function ClientMDXContent({ content }: ClientMDXContentProps) {
  // Move useMemo inside
  const mdxRuntime = useMemo(createRuntimeWithDevSupport, []);

  const mdxRemoteContent = useMemo(() => {
    // ... existing code ...
  }, [content, mdxRuntime]);

  return <MDXRemote {...mdxRemoteContent} components={mdxComponents} />;
}
