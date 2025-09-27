export interface ModuleManifestEntry {
  id: string;
  slug: string;
  title: string;
  description?: string;
  domain: string;
  order: number;
}

export interface ModuleManifest {
  version: number;
  updatedAt: string;
  modules: ModuleManifestEntry[];
}

