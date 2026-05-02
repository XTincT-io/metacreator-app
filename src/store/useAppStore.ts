import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Asset, TraitCategory, Project, Trait } from '../types';

interface AppStore extends AppState {
  // Actions
  setCurrentProject: (project: Project | null) => void;
  addAssets: (files: File[]) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  setSelectedAssets: (assetIds: string[]) => void;
  toggleAssetSelection: (assetId: string) => void;
  
  // Trait management
  addTraitCategory: (category: TraitCategory) => void;
  updateTraitCategory: (categoryName: string, updates: Partial<TraitCategory>) => void;
  removeTraitCategory: (categoryName: string) => void;
  updateAssetTraits: (assetId: string, traits: Record<string, string>) => void;
  batchUpdateTraits: (assetIds: string[], traitType: string, value: string) => void;
  
  // UI state
  toggleDarkMode: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: AppState['activePanel']) => void;
  setDraggedAsset: (asset: Asset | null) => void;
  setLoading: (loading: boolean) => void;
  setTutorialMode: (enabled: boolean) => void;
  
  // Utility functions
  calculateTraitRarities: () => void;
  exportMetadata: () => Promise<void>;
  importCSV: (file: File) => Promise<void>;
}

const createAssetFromFile = (file: File): Asset => {
  const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const type = getFileType(file);
  
  return {
    id,
    name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    file,
    type,
    url: URL.createObjectURL(file),
    traits: {},
    metadata: {
      name: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      attributes: []
    }
  };
};

const getFileType = (file: File): Asset['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) return '3d';
  return 'image'; // Default fallback
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Actions
      setCurrentProject: (project) => set({ currentProject: project }),

      addAssets: (files) => {
        const newAssets = files.map(createAssetFromFile);
        set((state) => ({
          assets: [...state.assets, ...newAssets]
        }));
        get().calculateTraitRarities();
      },

      removeAsset: (assetId) => {
        set((state) => ({
          assets: state.assets.filter(asset => asset.id !== assetId),
          selectedAssets: state.selectedAssets.filter(id => id !== assetId)
        }));
        get().calculateTraitRarities();
      },

      updateAsset: (assetId, updates) => {
        set((state) => ({
          assets: state.assets.map(asset =>
            asset.id === assetId ? { ...asset, ...updates } : asset
          )
        }));
      },

      setSelectedAssets: (assetIds) => set({ selectedAssets: assetIds }),

      toggleAssetSelection: (assetId) => {
        set((state) => ({
          selectedAssets: state.selectedAssets.includes(assetId)
            ? state.selectedAssets.filter(id => id !== assetId)
            : [...state.selectedAssets, assetId]
        }));
      },

      addTraitCategory: (category) => {
        set((state) => ({
          traitCategories: [...state.traitCategories, category]
        }));
      },

      updateTraitCategory: (categoryName, updates) => {
        set((state) => ({
          traitCategories: state.traitCategories.map(category =>
            category.name === categoryName ? { ...category, ...updates } : category
          )
        }));
      },

      removeTraitCategory: (categoryName) => {
        set((state) => ({
          traitCategories: state.traitCategories.filter(category => category.name !== categoryName)
        }));
      },

      updateAssetTraits: (assetId, traits) => {
        set((state) => ({
          assets: state.assets.map(asset =>
            asset.id === assetId
              ? {
                  ...asset,
                  traits,
                  metadata: {
                    ...asset.metadata,
                    attributes: Object.entries(traits).map(([trait_type, value]) => ({
                      trait_type,
                      value
                    }))
                  }
                }
              : asset
          )
        }));
        get().calculateTraitRarities();
      },

      batchUpdateTraits: (assetIds, traitType, value) => {
        set((state) => ({
          assets: state.assets.map(asset =>
            assetIds.includes(asset.id)
              ? {
                  ...asset,
                  traits: { ...asset.traits, [traitType]: value },
                  metadata: {
                    ...asset.metadata,
                    attributes: [
                      ...asset.metadata.attributes.filter(attr => attr.trait_type !== traitType),
                      { trait_type: traitType, value }
                    ]
                  }
                }
              : asset
          )
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
        
        // Count occurrences of each trait value
        assets.forEach(asset => {
          Object.entries(asset.traits).forEach(([traitType, value]) => {
            if (!traitCounts[traitType]) {
              traitCounts[traitType] = {};
            }
            traitCounts[traitType][value] = (traitCounts[traitType][value] || 0) + 1;
          });
        });

        // Calculate rarities and update trait categories
        const updatedCategories = Object.entries(traitCounts).map(([traitType, valueCounts]) => {
          const values = Object.entries(valueCounts).map(([value, count]) => ({
            value,
            count,
            rarity: (count / assets.length) * 100
          }));

          return {
            name: traitType,
            values,
            required: false
          };
        });

        set({ traitCategories: updatedCategories });
      },

      exportMetadata: async () => {
        const { assets } = get();
        set({ isLoading: true });

        try {
          // Create CSV content
          const csvHeaders = ['name', 'description', 'external_url', 'animation_url', 'attributes'];
          const csvRows = assets.map(asset => [
            asset.metadata.name,
            asset.metadata.description,
            asset.metadata.external_url || '',
            asset.metadata.animation_url || '',
            JSON.stringify(asset.metadata.attributes)
          ]);

          const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

          // Download CSV
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'metadata.csv';
          a.click();
          URL.revokeObjectURL(url);

        } catch (error) {
          console.error('Export failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      importCSV: async (file) => {
        set({ isLoading: true });
        // Implementation for CSV import would go here
        set({ isLoading: false });
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
