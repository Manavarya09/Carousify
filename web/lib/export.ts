import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/store/projectStore';

export interface ExportSlice {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateSlices(slotsCount: number): ExportSlice[] {
  const sliceWidth = CANVAS_WIDTH / slotsCount;
  const slices: ExportSlice[] = [];
  
  for (let i = 0; i < slotsCount; i++) {
    slices.push({
      index: i,
      x: i * sliceWidth,
      y: 0,
      width: sliceWidth,
      height: CANVAS_HEIGHT,
    });
  }
  
  return slices;
}

export function sliceCanvas(
  canvas: HTMLCanvasElement,
  slices: ExportSlice[]
): string[] {
  const dataUrls: string[] = [];
  
  for (const slice of slices) {
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = 1080;
    sliceCanvas.height = 1350;
    
    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      const sourceWidth = slice.width;
      const sourceHeight = slice.height;
      const destWidth = 1080;
      const destHeight = 1350;
      
      ctx.drawImage(
        canvas,
        slice.x,
        slice.y,
        sourceWidth,
        sourceHeight,
        0,
        0,
        destWidth,
        destHeight
      );
      
      dataUrls.push(sliceCanvas.toDataURL('image/png'));
    }
  }
  
  return dataUrls;
}

export async function downloadAsZip(dataUrls: string[], filename: string = 'carousify-export.zip') {
  const JSZip = (await import('jszip')).default;
  const { saveAs } = await import('file-saver');
  
  const zip = new JSZip();
  
  dataUrls.forEach((dataUrl, index) => {
    const base64Data = dataUrl.split(',')[1];
    zip.file(`carousel-${index + 1}.png`, base64Data, { base64: true });
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, filename);
}

export async function downloadAsPng(dataUrl: string, filename: string = 'carousify.png') {
  const { saveAs } = await import('file-saver');
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  saveAs(blob, filename);
}
