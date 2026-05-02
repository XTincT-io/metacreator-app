import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Folder, 
  Package, 
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ExportPanel: React.FC = () => {
  const {
    assets,
    traitCategories,
    exportMetadata,
    isLoading
  } = useAppStore();

  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeAssets, setIncludeAssets] = useState(true);
  const [platform, setPlatform] = useState<'opensea' | 'manifold' | 'custom'>('opensea');

  const handleExport = async () => {
    await exportMetadata();
  };

  const getExportSummary = () => {
    const totalAssets = assets.length;
    const assetsWithMetadata = assets.filter(a => a.metadata.description).length;
    const totalTraits = traitCategories.reduce((sum, cat) => sum + cat.values.length, 0);
    
    return {
      totalAssets,
      assetsWithMetadata,
      totalTraits,
      completionRate: totalAssets > 0 ? (assetsWithMetadata / totalAssets) * 100 : 0
    };
  };

  const summary = getExportSummary();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Collection
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generate metadata files for your NFT collection
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Collection Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {summary.totalAssets}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Assets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary.assetsWithMetadata}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">With Metadata</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {traitCategories.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Trait Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {summary.totalTraits}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Traits</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {summary.completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.completionRate}%` }}
                  className="bg-primary-600 h-2 rounded-full"
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {summary.completionRate < 100 && (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertCircle size={16} />
                <span>
                  {summary.totalAssets - summary.assetsWithMetadata} assets missing metadata
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings size={20} className="mr-2" />
              Export Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'opensea', label: 'OpenSea' },
                    { value: 'manifold', label: 'Manifold' },
                    { value: 'custom', label: 'Custom' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPlatform(option.value as any)}
                      className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                        platform === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'csv', label: 'CSV', icon: FileText },
                    { value: 'json', label: 'JSON', icon: Package }
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setExportFormat(option.value as any)}
                        className={`flex items-center space-x-2 p-3 text-sm font-medium rounded-lg border transition-colors ${
                          exportFormat === option.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                            : 'border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeAssets"
                  checked={includeAssets}
                  onChange={(e) => setIncludeAssets(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="includeAssets" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include asset files in export
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Export Preview
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <FileText size={16} className="text-primary-600 dark:text-primary-400" />
                <span className="text-gray-900 dark:text-white">
                  metadata.{exportFormat}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({summary.totalAssets} entries)
                </span>
              </div>
              
              {includeAssets && (
                <div className="flex items-center space-x-3">
                  <Folder size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-900 dark:text-white">
                    assets/
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ({summary.totalAssets} files)
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-gray-900 dark:text-white">
                  Optimized for {platform === 'opensea' ? 'OpenSea' : platform === 'manifold' ? 'Manifold' : 'Custom Platform'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={assets.length === 0 || isLoading}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              <Download size={20} />
              <span>
                {isLoading ? 'Exporting...' : `Export Collection (${exportFormat.toUpperCase()})`}
              </span>
            </motion.button>

            {assets.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Upload assets first to enable export
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 dark:bg-dark-600 rounded-lg p-6"
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Platform Resources
            </h4>
            <div className="space-y-2 text-sm">
              <a
                href="https://docs.opensea.io/docs/metadata-standards"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <ExternalLink size={14} />
                <span>OpenSea Metadata Standards</span>
              </a>
              <a
                href="https://docs.manifold.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <ExternalLink size={14} />
                <span>Manifold Documentation</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
