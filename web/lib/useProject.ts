import { useCallback, useEffect, useRef } from 'react';
import { useProjectStore, Project } from '@/store/projectStore';
import { projectsApi } from '@/lib/api';
import { debounce } from '@/lib/utils';

export function useAutosave() {
  const { currentProject, updateProject } = useProjectStore();
  const isInitialized = useRef(false);

  const saveToBackend = useCallback(async (project: Project) => {
    try {
      await projectsApi.update(project.id, {
        name: project.name,
        slots: project.slots,
      });
    } catch (error) {
      console.error('Failed to autosave:', error);
    }
  }, []);

  const debouncedSave = useCallback(
    debounce((project: Project) => {
      saveToBackend(project);
    }, 5000),
    [saveToBackend]
  );

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    if (currentProject) {
      debouncedSave(currentProject);
    }
  }, [currentProject, debouncedSave]);

  return { saveNow: saveToBackend };
}

export function useProjectStorage() {
  const { projects, addProject, deleteProject } = useProjectStore();

  const exportProject = useCallback(() => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carousify-projects-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projects]);

  const importProject = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          imported.forEach((project) => {
            useProjectStore.setState((state) => ({
              projects: [...state.projects, { ...project, id: crypto.randomUUID() }],
            }));
          });
        }
      } catch (error) {
        console.error('Failed to import projects:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return { exportProject, importProject };
}
