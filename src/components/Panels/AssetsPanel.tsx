import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Box,
  Trash2,
  Eye,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Asset } from '../../types';

export const AssetsPanel: React.FC = () => {
  const {
    assets,
    selectedAssets,
    addAssets,
    removeAsset,
    toggleAssetSelection,
    setSelectedAssets,
    tutorialMode
  } = useAppStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addAssets(acceptedFiles);
  }, [addAssets]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'model/*': ['.glb', '.gltf']
    },
    multiple: true
  });

  const getFileIcon = (type: Asset['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      case '3d': return Box;
      default: return ImageIcon;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map(asset => asset.id));
    }
  };

  const handleBulkDelete = () => {
    selectedAssets.forEach(assetId => removeAsset(assetId));
    setSelectedAssets([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assets
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {assets.length} files, {selectedAssets.length} selected
            </p>
          </div>
          
          {selectedAssets.length > 0 && (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete Selected</span>
              </motion.button>
            </div>
          )}
        </div>

        {assets.length > 0 && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {selectedAssets.length === assets.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {assets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex items-center justify-center p-6"
          >
            <div
              {...getRootProps()}
              className={`w-full max-w-md mx-auto border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="mb-4"
              >
                <Upload size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Upload your NFT assets'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Drag and drop files or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports: PNG, JPG, GIF, MP4, GLB, and more
              </p>
              
              {tutorialMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tutorial:</strong> Start by uploading your NFT collection files. 
                    The app will automatically detect traits and organize your metadata!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {assets.map((asset, index) => {
                  const Icon = getFileIcon(asset.type);
                  const isSelected = selectedAssets.includes(asset.id);

                  return (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative group bg-white dark:bg-dark-700 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/50'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <div className="aspect-square relative overflow-hidden rounded-t-xl">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-600">
                            <Icon size={32} className="text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-white dark:bg-dark-800 rounded-full shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-white dark:bg-dark-800 rounded-full shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-white dark:bg-dark-800 rounded-full shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAsset(asset.id);
                              }}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </motion.button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {asset.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {asset.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(asset.file.size)}
                          </span>
                        </div>
                        
                        {Object.keys(asset.traits).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(asset.traits).slice(0, 2).map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                              >
                                {value}
                              </span>
                            ))}
                            {Object.keys(asset.traits).length > 2 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                +{Object.keys(asset.traits).length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div
              {...getRootProps()}
              className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
                isDragActive
                  ? 'bg-primary-500 bg-opacity-20 backdrop-blur-sm'
                  : 'pointer-events-none opacity-0'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isDragActive ? 1 : 0.8, opacity: isDragActive ? 1 : 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-8 shadow-2xl border-2 border-dashed border-primary-400"
              >
                <Upload size={48} className="mx-auto text-primary-600 mb-4" />
                <p className="text-xl font-medium text-gray-900 dark:text-white text-center">
                  Drop files to add to collection
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
