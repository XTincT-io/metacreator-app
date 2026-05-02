import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Upload, Tags, FileText, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const TutorialOverlay: React.FC = () => {
  const { tutorialMode, setTutorialMode } = useAppStore();

  const steps = [
    {
      icon: Upload,
      title: 'Upload Your Assets',
      description: 'Drag and drop your NFT files (PNG, JPG, GIF, MP4, GLB) to get started.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Tags,
      title: 'Organize Traits',
      description: 'The app automatically detects traits or you can create custom categories.',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: FileText,
      title: 'Edit Metadata',
      description: 'Add descriptions, external URLs, and customize metadata for each asset.',
      color: 'text-sky-600 dark:text-sky-400'
    },
    {
      icon: Download,
      title: 'Export Collection',
      description: 'Generate CSV files and organized folders ready for NFT platforms.',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  if (!tutorialMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to ArtMeta Creator
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  From Art to NFT, Metadata Made Simple
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTutorialMode(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center ${step.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight size={20} className="text-gray-300 dark:text-gray-600 mt-4" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-sky-50 dark:from-primary-900/20 dark:to-sky-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Pro Tips
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>- Use consistent naming for better trait detection</li>
                <li>- Select multiple assets for batch editing</li>
                <li>- Preview your metadata before exporting</li>
                <li>- Export includes both CSV and organized asset folders</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTutorialMode(false);
                    }
                  }}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Don't show this again
                </span>
              </label>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTutorialMode(false)}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
