import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Tag,
  ChevronDown,
  ChevronRight,
  Shuffle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TraitCategory } from '../../types';

export const TraitsPanel: React.FC = () => {
  const {
    traitCategories,
    assets,
    selectedAssets,
    addTraitCategory,
    updateTraitCategory,
    removeTraitCategory,
    batchUpdateTraits,
    tutorialMode
  } = useAppStore();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: TraitCategory = {
        name: newCategoryName.trim(),
        values: [],
        required: false
      };
      addTraitCategory(newCategory);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleBatchUpdate = (traitType: string, value: string) => {
    if (selectedAssets.length > 0) {
      batchUpdateTraits(selectedAssets, traitType, value);
    }
  };

  const getTraitUsage = (categoryName: string, value: string) => {
    return assets.filter(asset => asset.traits[categoryName] === value).length;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Traits
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {traitCategories.length} categories, {selectedAssets.length} assets selected
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddCategory(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </motion.button>
        </div>

        {tutorialMode && traitCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tutorial:</strong> Traits are automatically detected from your assets, 
              or you can create custom categories to organize your NFT attributes.
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence>
          {showAddCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name (e.g., Background, Eyes, Hat)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <AnimatePresence>
            {traitCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                    onClick={() => toggleCategory(category.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} className="text-gray-400" />
                      </motion.div>
                      <Tag size={16} className="text-primary-600 dark:text-primary-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category.values.length} values
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(category.name);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-500 transition-colors"
                      >
                        <Edit3 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTraitCategory(category.name);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 dark:border-dark-600"
                      >
                        <div className="p-4 space-y-3">
                          {category.values.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <Tag size={32} className="mx-auto mb-2 opacity-50" />
                              <p>No values yet</p>
                              <p className="text-sm">Values will appear as you assign traits to assets</p>
                            </div>
                          ) : (
                            category.values.map((traitValue) => {
                              const usage = getTraitUsage(category.name, traitValue.value);
                              
                              return (
                                <motion.div
                                  key={traitValue.value}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-600 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {traitValue.value}
                                      </span>
                                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                        <BarChart3 size={14} />
                                        <span>{traitValue.rarity.toFixed(1)}%</span>
                                        <span>({usage}/{assets.length})</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2 w-full bg-gray-200 dark:bg-dark-500 rounded-full h-2">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${traitValue.rarity}%` }}
                                        className="bg-primary-600 h-2 rounded-full"
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                      />
                                    </div>
                                  </div>

                                  {selectedAssets.length > 0 && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleBatchUpdate(category.name, traitValue.value)}
                                      className="ml-4 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                      Apply to Selected
                                    </motion.button>
                                  )}
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {traitCategories.length === 0 && !showAddCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Tag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No trait categories yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Upload assets or create custom trait categories to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddCategory(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
              >
                <Plus size={16} />
                <span>Create First Category</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
