export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  templateId: string;
  slots: SlotData[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
  cropData?: CropData;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  sliceCount: number;
}

export interface SlicedImage {
  index: number;
  dataUrl: string;
  filename: string;
}

export interface AutoCropResult {
  success: boolean;
  cropData?: CropData;
  detectedFaces?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  error?: string;
}

export interface BackgroundRemovalResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface Template {
  id: string;
  name: string;
  layout: string;
  description: string;
  category: string;
  thumbnail: string;
  slots: TemplateSlot[];
}

export interface TemplateSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}
