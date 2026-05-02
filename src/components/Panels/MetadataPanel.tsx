import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Edit3, 
  Save, 
  X, 
  ExternalLink,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const MetadataPanel: React.FC = () => {
  const {
    assets,
    selectedAssets,
    updateAsset,
    tutorialMode
  } = useAppStore();

  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    external_url: '',
    animation_url: ''
  });

  const selectedAssetObjects = assets.filter(asset => selectedAssets.includes(asset.id));
  const displayAssets = selectedAssetObjects.length > 0 ? selectedAssetObjects : assets;

  const handleEditStart = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setEditForm({
        name: asset.metadata.name,
        description: asset.metadata.description,
        external_url: asset.metadata.external_url || '',
        animation_url: asset.metadata.animation_url || ''
      });
      setEditingAsset(assetId);
    }
  };

  const handleEditSave = () => {
    if (editingAsset) {
      updateAsset(editingAsset, {
        metadata: {
          ...assets.find(a => a.id === editingAsset)!.metadata,
          ...editForm
        }
      });
      setEditingAsset(null);
    }
  };

  const handleEditCancel = () => {
    setEditingAsset(null);
    setEditForm({ name: '', description: '', external_url: '', animation_url: '' });
  };

  const handleBatchUpdate = (field: keyof typeof editForm, value: string) => {
    selectedAssets.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        updateAsset(assetId, {
          metadata: {
            ...asset.metadata,
            [field]: value
          }
        });
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Metadata
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayAssets.length} assets, {selectedAssets.length > 0 ? 'Selected items' : 'All items'}
            </p>
          </div>
        </div>

        {selectedAssets.length > 1 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Batch Edit Mode
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Changes will be applied to all {selectedAssets.length} selected assets
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Description Template
                </label>
                <input
                  type="text"
                  placeholder="e.g., Part of the Amazing Collection"
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBatchUpdate('description', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  External URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-website.com"
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBatchUpdate('external_url', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {tutorialMode && displayAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Tutorial:</strong> Edit individual metadata or use batch edit for multiple assets. 
              This information will be included in your exported CSV file.
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {displayAssets.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No assets to edit
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Upload some assets first to start editing metadata
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {displayAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 overflow-hidden"
                >
                  <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-dark-600">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-600 flex-shrink-0">
                      {asset.type === 'image' ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {asset.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.type.toUpperCase()}, {Object.keys(asset.traits).length} traits
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditStart(asset.id)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                      <span>Edit</span>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {editingAsset === asset.id ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder="Describe this NFT..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <ExternalLink size={16} className="inline mr-1" />
                              External URL
                            </label>
                            <input
                              type="url"
                              value={editForm.external_url}
                              onChange={(e) => setEditForm({ ...editForm, external_url: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="https://your-website.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Globe size={16} className="inline mr-1" />
                              Animation URL
                            </label>
                            <input
                              type="url"
                              value={editForm.animation_url}
                              onChange={(e) => setEditForm({ ...editForm, animation_url: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="https://animation-url.com"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-600">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEditCancel}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEditSave}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
                          >
                            <Save size={16} />
                            <span>Save Changes</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Description:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {asset.metadata.description || 'No description'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">External URL:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {asset.metadata.external_url ? (
                                <a
                                  href={asset.metadata.external_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                  {asset.metadata.external_url}
                                </a>
                              ) : (
                                'Not set'
                              )}
                            </p>
                          </div>
                        </div>

                        {asset.metadata.attributes.length > 0 && (
                          <div className="mt-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Attributes:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {asset.metadata.attributes.map((attr, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-full"
                                >
                                  {attr.trait_type}: {attr.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
