'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '@/store/projectStore';

export default function ProjectList() {
  const { projects, loadProject, deleteProject } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No saved projects yet</p>
        <p className="text-sm text-gray-400">
          Create a carousel from templates to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            selectedProject === project.id
              ? 'border-lavender-300 bg-lavender-50'
              : 'border-cream-200 hover:border-lavender-200'
          }`}
          onClick={() => setSelectedProject(project.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">{project.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadProject(project.id);
                }}
                className="px-3 py-1.5 text-sm bg-lavender-100 text-lavender-500 rounded-lg hover:bg-lavender-200"
              >
                Open
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
