import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Slot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
}

export interface Template {
  id: string;
  name: string;
  layout: string;
  thumbnail: string;
  slots: Omit<Slot, 'id' | 'image' | 'imagePosition' | 'imageScale'>[];
}

export interface Project {
  id: string;
  name: string;
  templateId: string;
  slots: Slot[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  selectedTemplate: Template | null;
  selectedSlotId: string | null;
  
  setSelectedTemplate: (template: Template | null) => void;
  setSelectedSlot: (slotId: string | null) => void;
  
  addProject: (name: string, template: Template) => Project;
  loadProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  setSlotImage: (slotId: string, image: string) => void;
  updateSlotImagePosition: (slotId: string, position: { x: number; y: number }) => void;
  updateSlotImageScale: (slotId: string, scale: number) => void;
  clearSlotImage: (slotId: string) => void;
  
  exportProject: () => Project | null;
}

const CANVAS_WIDTH = 3050;
const CANVAS_HEIGHT = 1350;

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      selectedTemplate: null,
      selectedSlotId: null,

      setSelectedTemplate: (template) => {
        if (template) {
          const slots: Slot[] = template.slots.map((slot) => ({
            ...slot,
            id: uuidv4(),
            image: undefined,
            imagePosition: { x: 0, y: 0 },
            imageScale: 1,
          }));
          
          const project: Project = {
            id: uuidv4(),
            name: `${template.name} - ${new Date().toLocaleDateString()}`,
            templateId: template.id,
            slots,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({ selectedTemplate: template, currentProject: project });
        } else {
          set({ selectedTemplate: null, currentProject: null });
        }
      },

      setSelectedSlot: (slotId) => {
        set({ selectedSlotId: slotId });
      },

      addProject: (name, template) => {
        const slots: Slot[] = template.slots.map((slot) => ({
          ...slot,
          id: uuidv4(),
          image: undefined,
          imagePosition: { x: 0, y: 0 },
          imageScale: 1,
        }));

        const project: Project = {
          id: uuidv4(),
          name,
          templateId: template.id,
          slots,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [...state.projects, project],
        }));

        return project;
      },

      loadProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
          set({ currentProject: project });
        }
      },

      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
              : state.currentProject,
        }));
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId ? null : state.currentProject,
        }));
      },

      setSlotImage: (slotId, image) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const updatedSlots = state.currentProject.slots.map((slot) =>
            slot.id === slotId
              ? { ...slot, image, imagePosition: { x: 0, y: 0 }, imageScale: 1 }
              : slot
          );

          return {
            currentProject: {
              ...state.currentProject,
              slots: updatedSlots,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateSlotImagePosition: (slotId, position) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const updatedSlots = state.currentProject.slots.map((slot) =>
            slot.id === slotId
              ? { ...slot, imagePosition: position }
              : slot
          );

          return {
            currentProject: {
              ...state.currentProject,
              slots: updatedSlots,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateSlotImageScale: (slotId, scale) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const updatedSlots = state.currentProject.slots.map((slot) =>
            slot.id === slotId
              ? { ...slot, imageScale: scale }
              : slot
          );

          return {
            currentProject: {
              ...state.currentProject,
              slots: updatedSlots,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      clearSlotImage: (slotId) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const updatedSlots = state.currentProject.slots.map((slot) =>
            slot.id === slotId
              ? { ...slot, image: undefined, imagePosition: { x: 0, y: 0 }, imageScale: 1 }
              : slot
          );

          return {
            currentProject: {
              ...state.currentProject,
              slots: updatedSlots,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      exportProject: () => {
        return get().currentProject;
      },
    }),
    {
      name: 'carousify-storage',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);

export { CANVAS_WIDTH, CANVAS_HEIGHT };
