import React from 'react';
import { 
  Image, 
  Tags, 
  FileText, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Folder,
  Palette
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const {
    activePanel,
    setActivePanel,
    sidebarCollapsed,
    setSidebarCollapsed,
    assets,
    traitCategories
  } = useAppStore();

  const menuItems = [
    {
      id: 'assets' as const,
      label: 'Assets',
      icon: Image,
      count: assets.length,
      description: 'Manage your NFT assets'
    },
    {
      id: 'traits' as const,
      label: 'Traits',
      icon: Tags,
      count: traitCategories.length,
      description: 'Configure trait categories'
    },
    {
      id: 'metadata' as const,
      label: 'Metadata',
      icon: FileText,
      count: assets.filter(a => a.metadata.description).length,
      description: 'Edit metadata templates'
    },
    {
      id: 'export' as const,
      label: 'Export',
      icon: Download,
      count: 0,
      description: 'Export your collection'
    }
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePanel(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.count > 0 && (
                          <span className="text-xs bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-t border-gray-200 dark:border-dark-700"
            >
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Palette size={16} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Pro Tip
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Drag and drop multiple files to batch process your NFT collection!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
