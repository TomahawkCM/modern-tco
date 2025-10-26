declare module "*.mdx" {
  import type { ComponentType } from "react";

  interface MDXProps {
    components?: Record<string, ComponentType<any>>;
  }

  const MDXContent: ComponentType<MDXProps>;
  export default MDXContent;
}

// TypeScript declarations for MDX content modules
declare module "@/content/modules/*.mdx" {
  import type { ComponentType } from "react";

  interface MDXProps {
    components?: Record<string, ComponentType<any>>;
  }

  const MDXContent: ComponentType<MDXProps>;
  export default MDXContent;
}
