export interface Asset {
  id: string;
  name: string;
  file: File;
  type: 'image' | 'video' | '3d' | 'audio';
  url: string;
  traits: Record<string, string>;
  metadata: AssetMetadata;
  folder?: string;
}

export interface AssetMetadata {
  name: string;
  description: string;
  external_url?: string;
  animation_url?: string;
  attributes: Trait[];
}

export interface Trait {
  trait_type: string;
  value: string;
  rarity?: number;
}

export interface TraitCategory {
  name: string;
  values: TraitValue[];
  required: boolean;
}

export interface TraitValue {
  value: string;
  count: number;
  rarity: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  assets: Asset[];
  traitCategories: TraitCategory[];
  template: MetadataTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetadataTemplate {
  name: string;
  fields: TemplateField[];
  platform: 'opensea' | 'manifold' | 'custom';
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'url' | 'textarea';
  required: boolean;
  defaultValue?: string;
}

export interface AppState {
  currentProject: Project | null;
  assets: Asset[];
  traitCategories: TraitCategory[];
  selectedAssets: string[];
  isDarkMode: boolean;
  sidebarCollapsed: boolean;
  activePanel: 'assets' | 'traits' | 'metadata' | 'export';
  draggedAsset: Asset | null;
  isLoading: boolean;
  tutorialMode: boolean;
}
