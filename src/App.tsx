import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { AssetsPanel } from './components/Panels/AssetsPanel';
import { TraitsPanel } from './components/Panels/TraitsPanel';
import { MetadataPanel } from './components/Panels/MetadataPanel';
import { ExportPanel } from './components/Panels/ExportPanel';
import { TutorialOverlay } from './components/TutorialOverlay';
import { useAppStore } from './store/useAppStore';

const App: React.FC = () => {
  const { activePanel, isDarkMode } = useAppStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'assets':
        return <AssetsPanel />;
      case 'traits':
        return <TraitsPanel />;
      case 'metadata':
        return <MetadataPanel />;
      case 'export':
        return <ExportPanel />;
      default:
        return <AssetsPanel />;
    }
  };

  return (
    <Router>
      <div className="h-screen bg-gray-50 dark:bg-dark-900 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          
          <motion.main
            key={activePanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            {renderActivePanel()}
          </motion.main>
        </div>

        <TutorialOverlay />
        
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDarkMode ? '#1e293b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
