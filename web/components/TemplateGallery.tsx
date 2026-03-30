'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { templates, categories, TemplateDefinition } from '../../shared/templates';
import { useProjectStore, Template } from '@/store/projectStore';

interface TemplateGalleryProps {
  onSelectTemplate: () => void;
}

export default function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const { setSelectedTemplate } = useProjectStore();

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleTemplateClick = (template: TemplateDefinition) => {
    const formattedTemplate: Template = {
      id: template.id,
      name: template.name,
      layout: template.layout,
      thumbnail: template.thumbnail,
      slots: template.slots,
    };
    setSelectedTemplate(formattedTemplate);
    onSelectTemplate();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Choose a Template
        </h2>
        <p className="text-gray-500">
          Select a layout to start creating your carousel
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-3 mb-8 overflow-x-auto pb-2"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-lavender-200 text-lavender-500 shadow-soft'
                : 'bg-cream-200 text-gray-600 hover:bg-cream-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </motion.div>

      <motion.div
        layout
        className="masonry-grid"
      >
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="cursor-pointer"
              onHoverStart={() => setHoveredTemplate(template.id)}
              onHoverEnd={() => setHoveredTemplate(null)}
              onClick={() => handleTemplateClick(template)}
            >
              <motion.div
                className="card relative overflow-hidden group"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="aspect-[9:16] bg-cream-100 rounded-2xl mb-4 overflow-hidden relative"
                  style={{
                    background: `linear-gradient(135deg, ${
                      index % 4 === 0
                        ? '#EDE9FE'
                        : index % 4 === 1
                        ? '#DBEAFE'
                        : index % 4 === 2
                        ? '#FCE7F3'
                        : '#F5EBD8'
                    } 0%, white 100%)`,
                  }}
                >
                  <TemplatePreview template={template} />
                  
                  <motion.div
                    className="absolute inset-0 bg-lavender-200/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="text-lavender-500 font-semibold text-lg">
                      Use Template
                    </span>
                  </motion.div>
                </div>

                <div className="px-2">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 shadow-soft">
                    {template.slots.length} slots
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TemplatePreview({ template }: { template: TemplateDefinition }) {
  const scale = 0.15;
  const canvasWidth = 3050 * scale;
  const canvasHeight = 1350 * scale;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-3"
      style={{ width: canvasWidth, height: canvasHeight, transform: 'scale(0.15)', transformOrigin: 'center', left: '50%', top: '50%', marginLeft: -canvasWidth / 2, marginTop: -canvasHeight / 2 }}
    >
      <svg
        viewBox="0 0 3050 1350"
        className="w-full h-full"
        style={{ position: 'absolute', transform: 'scale(6.67)', transformOrigin: 'center' }}
      >
        {template.slots.map((slot, idx) => (
          <rect
            key={idx}
            x={slot.x}
            y={slot.y}
            width={slot.width}
            height={slot.height}
            fill="white"
            stroke="#DDD6FE"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div
        className="absolute"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: 'scale(6.67)',
          transformOrigin: 'center',
        }}
      >
        <svg viewBox="0 0 3050 1350" className="w-full h-full">
          {template.slots.map((slot, idx) => (
            <rect
              key={idx}
              x={slot.x}
              y={slot.y}
              width={slot.width}
              height={slot.height}
              fill="white"
              stroke="#DDD6FE"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
