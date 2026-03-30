'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TemplateGallery from '@/components/TemplateGallery';
import { useProjectStore } from '@/store/projectStore';

const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), {
  ssr: false,
});

export default function Home() {
  const [currentView, setCurrentView] = useState<'templates' | 'editor'>('templates');
  const { selectedTemplate } = useProjectStore();

  const handleTemplateSelect = () => {
    setCurrentView('editor');
  };

  return (
    <main className="min-h-screen bg-cream-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currentView === 'templates' ? (
          <TemplateGallery onSelectTemplate={handleTemplateSelect} />
        ) : (
          <CanvasEditor onBack={() => setCurrentView('templates')} />
        )}
      </motion.div>
    </main>
  );
}
