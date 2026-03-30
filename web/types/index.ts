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

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
