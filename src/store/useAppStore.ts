import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import JSZip from 'jszip';
import { AppState, Asset, TraitCategory, Project } from '../types';

export type ExportFormat = 'csv' | 'json';
export type ExportPlatform = 'opensea' | 'manifold' | 'custom';

export interface ExportMetadataOptions {
  format?: ExportFormat;
  includeAssets?: boolean;
  platform?: ExportPlatform;
}

interface AppStore extends AppState {
  setCurrentProject: (project: Project | null) => void;
  addAssets: (files: File[]) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  setSelectedAssets: (assetIds: string[]) => void;
  toggleAssetSelection: (assetId: string) => void;

  addTraitCategory: (category: TraitCategory) => void;
  updateTraitCategory: (categoryName: string, updates: Partial<TraitCategory>) => void;
  removeTraitCategory: (categoryName: string) => void;
  updateAssetTraits: (assetId: string, traits: Record<string, string>) => void;
  batchUpdateTraits: (assetIds: string[], traitType: string, value: string) => void;

  toggleDarkMode: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: AppState['activePanel']) => void;
  setDraggedAsset: (asset: Asset | null) => void;
  setLoading: (loading: boolean) => void;
  setTutorialMode: (enabled: boolean) => void;

  calculateTraitRarities: () => void;
  exportMetadata: (options?: ExportMetadataOptions) => Promise<void>;
  importCSV: (file: File) => Promise<void>;
}

const escapeCsvValue = (value: unknown): string => {
  const raw = String(value ?? '');
  const escaped = raw.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const parseCsvRows = (csvText: string): Record<string, string>[] => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {} as Record<string, string>);
  });
};

const buildPlatformMetadata = (asset: Asset, platform: ExportPlatform) => {
  const base = {
    name: asset.metadata.name || asset.name,
    description: asset.metadata.description || '',
    external_url: asset.metadata.external_url || '',
    animation_url: asset.metadata.animation_url || '',
    attributes: asset.metadata.attributes.map((attr) => ({
      trait_type: attr.trait_type,
      value: attr.value,
      ...(attr.rarity !== undefined ? { rarity: attr.rarity } : {})
    }))
  };

  if (platform === 'manifold') {
    return {
      ...base,
      image: asset.url,
      attributes: base.attributes
    };
  }

  if (platform === 'custom') {
    return {
      ...base,
      collection: 'metacreator-app',
      asset_id: asset.id,
      asset_type: asset.type,
      traits: Object.fromEntries(Object.entries(asset.traits))
    };
  }

  return base;
};

const getFileType = (file: File): Asset['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) return '3d';
  return 'image';
};

const createAssetFromFile = (file: File): Asset => {
  const id = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const type = getFileType(file);
  const name = file.name.replace(/\.[^/.]+$/, '');

  return {
    id,
    name,
    file,
    type,
    url: URL.createObjectURL(file),
    traits: {},
    metadata: {
      name,
      description: '',
      attributes: []
    }
  };
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      assets: [],
      traitCategories: [],
      selectedAssets: [],
      isDarkMode: false,
      sidebarCollapsed: false,
      activePanel: 'assets',
      draggedAsset: null,
      isLoading: false,
      tutorialMode: true,

      setCurrentProject: (project) => set({ currentProject: project }),

      addAssets: (files) => {
        const newAssets = files.map(createAssetFromFile);
        set((state) => ({ assets: [...state.assets, ...newAssets] }));
        get().calculateTraitRarities();
      },

      removeAsset: (assetId) => {
        const asset = get().assets.find((item) => item.id === assetId);
        if (asset?.url) {
          URL.revokeObjectURL(asset.url);
        }

        set((state) => ({
          assets: state.assets.filter((item) => item.id !== assetId),
          selectedAssets: state.selectedAssets.filter((id) => id !== assetId)
        }));
        get().calculateTraitRarities();
      },

      updateAsset: (assetId, updates) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  ...updates,
                  metadata: updates.metadata
                    ? { ...asset.metadata, ...updates.metadata }
                    : asset.metadata
                }
              : asset
          )
        }));
      },

      setSelectedAssets: (assetIds) => set({ selectedAssets: assetIds }),

      toggleAssetSelection: (assetId) => {
        set((state) => ({
          selectedAssets: state.selectedAssets.includes(assetId)
            ? state.selectedAssets.filter((id) => id !== assetId)
            : [...state.selectedAssets, assetId]
        }));
      },

      addTraitCategory: (category) => {
        set((state) => ({ traitCategories: [...state.traitCategories, category] }));
      },

      updateTraitCategory: (categoryName, updates) => {
        set((state) => ({
          traitCategories: state.traitCategories.map((category) =>
            category.name === categoryName ? { ...category, ...updates } : category
          )
        }));
      },

      removeTraitCategory: (categoryName) => {
        set((state) => ({
          traitCategories: state.traitCategories.filter((category) => category.name !== categoryName)
        }));
      },

      updateAssetTraits: (assetId, traits) => {
        set((state) => ({
          assets: state.assets.map((asset) => {
            if (asset.id !== assetId) return asset;
            return {
              ...asset,
              traits,
              metadata: {
                ...asset.metadata,
                attributes: Object.entries(traits).map(([trait_type, value]) => ({ trait_type, value }))
              }
            };
          })
        }));
        get().calculateTraitRarities();
      },

      batchUpdateTraits: (assetIds, traitType, value) => {
        set((state) => ({
          assets: state.assets.map((asset) => {
            if (!assetIds.includes(asset.id)) return asset;
            return {
              ...asset,
              traits: { ...asset.traits, [traitType]: value },
              metadata: {
                ...asset.metadata,
                attributes: [
                  ...asset.metadata.attributes.filter((attr) => attr.trait_type !== traitType),
                  { trait_type: traitType, value }
                ]
              }
            };
          })
        }));
        get().calculateTraitRarities();
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
        document.documentElement.classList.toggle('dark');
      },

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setDraggedAsset: (asset) => set({ draggedAsset: asset }),
      setLoading: (loading) => set({ isLoading: loading }),
      setTutorialMode: (enabled) => set({ tutorialMode: enabled }),

      calculateTraitRarities: () => {
        const { assets } = get();
        const traitCounts: Record<string, Record<string, number>> = {};

        assets.forEach((asset) => {
          Object.entries(asset.traits).forEach(([traitType, value]) => {
            if (!traitCounts[traitType]) traitCounts[traitType] = {};
            traitCounts[traitType][value] = (traitCounts[traitType][value] || 0) + 1;
          });
        });

        const updatedCategories = Object.entries(traitCounts).map(([traitType, valueCounts]) => ({
          name: traitType,
          values: Object.entries(valueCounts).map(([value, count]) => ({
            value,
            count,
            rarity: assets.length ? (count / assets.length) * 100 : 0
          })),
          required: false
        }));

        set({ traitCategories: updatedCategories });
      },

      exportMetadata: async (options = {}) => {
        const { assets } = get();
        const {
          format = 'csv',
          includeAssets = true,
          platform = 'opensea'
        } = options;

        if (assets.length === 0) return;

        set({ isLoading: true });

        try {
          const rows = assets.map((asset) => buildPlatformMetadata(asset, platform));

          if (includeAssets) {
            const zip = new JSZip();
            const metadataFileName = `metadata.${format}`;

            zip.file(
              metadataFileName,
              format === 'json'
                ? JSON.stringify(rows, null, 2)
                : [
                    ['name', 'description', 'external_url', 'animation_url', 'attributes'],
                    ...rows.map((row) => [
                      row.name,
                      row.description,
                      row.external_url || '',
                      row.animation_url || '',
                      JSON.stringify(row.attributes)
                    ])
                  ]
                    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
                    .join('\n')
            );

            assets.forEach((asset) => {
              const fileExt = asset.file.name.includes('.') ? asset.file.name.split('.').pop() : '';
              const fileName = fileExt ? `${asset.name}.${fileExt}` : asset.name;
              zip.file(`assets/${fileName}`, asset.file);
            });

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `collection-${platform}.zip`;
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            return;
          }

          const content =
            format === 'json'
              ? JSON.stringify(rows, null, 2)
              : [
                  ['name', 'description', 'external_url', 'animation_url', 'attributes'],
                  ...rows.map((row) => [
                    row.name,
                    row.description,
                    row.external_url || '',
                    row.animation_url || '',
                    JSON.stringify(row.attributes)
                  ])
                ]
                  .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
                  .join('\n');

          const blob = new Blob([content], {
            type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8'
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `metadata.${format}`;
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
          console.error('Export failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      importCSV: async (file) => {
        set({ isLoading: true });

        try {
          const text = await file.text();
          const rows = parseCsvRows(text);
          if (rows.length === 0) return;

          const currentAssets = get().assets;
          rows.forEach((row) => {
            const name = (row.name || '').trim();
            if (!name) return;

            const match = currentAssets.find((asset) => {
              const normalizedAssetName = asset.name.toLowerCase();
              const normalizedRowName = name.toLowerCase();
              return normalizedAssetName === normalizedRowName || normalizedAssetName === normalizedRowName.replace(/\.[^/.]+$/, '');
            });

            if (!match) return;

            let parsedAttributes: Array<{ trait_type: string; value: string }> = [];
            const rawAttributes = row.attributes?.trim();
            if (rawAttributes) {
              try {
                const parsed = JSON.parse(rawAttributes);
                if (Array.isArray(parsed)) {
                  parsedAttributes = parsed.filter(
                    (item) => item && typeof item === 'object' && 'trait_type' in item && 'value' in item
                  ) as Array<{ trait_type: string; value: string }>;
                }
              } catch {
                parsedAttributes = [];
              }
            }

            const traits = parsedAttributes.reduce((acc, attr) => {
              acc[attr.trait_type] = String(attr.value);
              return acc;
            }, {} as Record<string, string>);

            set((state) => ({
              assets: state.assets.map((asset) => {
                if (asset.id !== match.id) return asset;
                return {
                  ...asset,
                  name: name || asset.name,
                  traits: Object.keys(traits).length > 0 ? { ...asset.traits, ...traits } : asset.traits,
                  metadata: {
                    ...asset.metadata,
                    name: name || asset.metadata.name,
                    description: row.description ?? asset.metadata.description,
                    external_url: row.external_url ?? asset.metadata.external_url,
                    animation_url: row.animation_url ?? asset.metadata.animation_url,
                    attributes: parsedAttributes.length > 0 ? parsedAttributes : asset.metadata.attributes
                  }
                };
              })
            }));
          });

          get().calculateTraitRarities();
        } catch (error) {
          console.error('CSV import failed:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'artmeta-creator-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        tutorialMode: state.tutorialMode,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);
