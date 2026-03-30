'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore, CANVAS_WIDTH, CANVAS_HEIGHT, Slot } from '@/store/projectStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface CanvasEditorProps {
  onBack: () => void;
}

const SCALE = 0.25;

export default function CanvasEditor({ onBack }: CanvasEditorProps) {
  const {
    currentProject,
    selectedSlotId,
    setSelectedSlot,
    setSlotImage,
    updateSlotImagePosition,
    updateSlotImageScale,
    clearSlotImage,
  } = useProjectStore();

  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height - 60 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const loadImage = useCallback((slotId: string, imageUrl: string) => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImages((prev) => ({ ...prev, [slotId]: img }));
    };
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const slotId = selectedSlotId;
      if (!slotId) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setSlotImage(slotId, result);
          loadImage(slotId, result);
        };
        reader.readAsDataURL(file);
      }
    },
    [selectedSlotId, setSlotImage, loadImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setSlotImage(slotId, result);
          loadImage(slotId, result);
        };
        reader.readAsDataURL(file);
      }
    },
    [setSlotImage, loadImage]
  );

  const handleExport = async () => {
    if (!currentProject) return;

    const stageRef = document.querySelector('.konva-stage') as HTMLDivElement;
    const zip = new JSZip();

    const slotWidth = CANVAS_WIDTH / currentProject.slots.length;
    
    for (let i = 0; i < currentProject.slots.length; i++) {
      const slot = currentProject.slots[i];
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');

      if (ctx && slot.image && images[slot.id]) {
        const img = images[slot.id];
        const scale = Math.max(
          slotWidth / img.width,
          1350 / img.height
        );
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (slotWidth - scaledWidth) / 2 + slot.imagePosition.x;
        const y = (1350 - scaledHeight) / 2 + slot.imagePosition.y;

        ctx.drawImage(
          img,
          x + (slotWidth * i),
          y,
          scaledWidth,
          scaledHeight
        );
      }

      const dataUrl = canvas.toDataURL('image/png');
      zip.file(`carousel-${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'carousify-export.zip');
    setShowExportMenu(false);
  };

  const handleExportPNG = async () => {
    if (!currentProject) return;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (const slot of currentProject.slots) {
        if (slot.image && images[slot.id]) {
          const img = images[slot.id];
          const scale = Math.max(
            slot.width / img.width,
            slot.height / img.height
          ) * slot.imageScale;
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = slot.x + (slot.width - scaledWidth) / 2 + slot.imagePosition.x;
          const y = slot.y + (slot.height - scaledHeight) / 2 + slot.imagePosition.y;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        }
      }
    }

    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, 'carousify-canvas.png');
    });
    setShowExportMenu(false);
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No project selected</p>
          <button onClick={onBack} className="btn-primary">
            Go to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-cream-200 text-gray-700 rounded-xl font-medium hover:bg-cream-300 transition-colors"
          >
            Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentProject.name}
            </h2>
            <p className="text-sm text-gray-500">
              {currentProject.slots.length} slots - {CANVAS_WIDTH}x{CANVAS_HEIGHT}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="btn-primary"
          >
            Export
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExportMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-6 top-40 bg-white rounded-2xl shadow-soft-lg p-4 z-50"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Export Options</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-lavender-100 text-lavender-500 rounded-xl font-medium hover:bg-lavender-200 transition-colors text-left"
              >
                Download ZIP (3x 1080x1350)
              </button>
              <button
                onClick={handleExportPNG}
                className="px-4 py-2.5 bg-babyblue-100 text-gray-700 rounded-xl font-medium hover:bg-babyblue-200 transition-colors text-left"
              >
                Download Full Canvas
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div
            ref={containerRef}
            className="bg-white rounded-3xl shadow-soft overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="p-4 bg-cream-100 border-b border-cream-200 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                Drag and drop images into slots
              </span>
              <span className="text-xs text-gray-400">
                Scale: {Math.round(SCALE * 100)}%
              </span>
            </div>
            <div
              className="konva-stage flex items-center justify-center bg-gray-100"
              style={{
                height: containerSize.height,
                minHeight: 400,
              }}
            >
              <div
                style={{
                  width: CANVAS_WIDTH * SCALE,
                  height: CANVAS_HEIGHT * SCALE,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                <Stage
                  width={CANVAS_WIDTH * SCALE}
                  height={CANVAS_HEIGHT * SCALE}
                  scaleX={SCALE}
                  scaleY={SCALE}
                >
                  <Layer>
                    {currentProject.slots.map((slot) => (
                      <SlotComponent
                        key={slot.id}
                        slot={slot}
                        isSelected={selectedSlotId === slot.id}
                        onSelect={() => setSelectedSlot(slot.id)}
                        onPositionChange={(pos) =>
                          updateSlotImagePosition(slot.id, pos)
                        }
                        onScaleChange={(scale) =>
                          updateSlotImageScale(slot.id, scale)
                        }
                        image={images[slot.id]}
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Slots</h3>
            <div className="space-y-3">
              {currentProject.slots.map((slot, idx) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedSlotId === slot.id
                      ? 'border-lavender-300 bg-lavender-50'
                      : 'border-cream-200 hover:border-lavender-200'
                  }`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">
                      Slot {idx + 1}
                    </span>
                    {slot.image ? (
                      <span className="text-xs text-green-600">Image added</span>
                    ) : (
                      <span className="text-xs text-gray-400">Empty</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, slot.id)}
                    className="hidden"
                    id={`file-${slot.id}`}
                  />
                  <label
                    htmlFor={`file-${slot.id}`}
                    className="block w-full text-center px-3 py-2 bg-cream-100 hover:bg-cream-200 rounded-lg text-sm text-gray-600 cursor-pointer transition-colors"
                  >
                    {slot.image ? 'Change Image' : 'Upload Image'}
                  </label>
                  {slot.image && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSlotImage(slot.id);
                      }}
                      className="mt-2 w-full text-center text-sm text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedSlotId && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">
                Edit Selected Slot
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Use the canvas to drag and position your image within the slot.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SlotComponentProps {
  slot: Slot;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
  image?: HTMLImageElement;
}

function SlotComponent({
  slot,
  isSelected,
  onSelect,
  onPositionChange,
  onScaleChange,
  image,
}: SlotComponentProps) {
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    setImagePos(slot.imagePosition);
    setImageScale(slot.imageScale);
  }, [slot.imagePosition, slot.imageScale]);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    };
    setImagePos(newPos);
    onPositionChange(newPos);
  };

  const handleTransformEnd = () => {
    if (imageRef.current) {
      const scale = imageRef.current.scaleX();
      setImageScale(scale);
      onScaleChange(scale);
    }
  };

  return (
    <>
      <Rect
        x={slot.x}
        y={slot.y}
        width={slot.width}
        height={slot.height}
        fill={isSelected ? '#EDE9FE' : '#F5F5F5'}
        stroke={isSelected ? '#8B5CF6' : '#E5E5E5'}
        strokeWidth={isSelected ? 3 : 1}
        onClick={onSelect}
        onTap={onSelect}
      />
      {image && (
        <KonvaImage
          ref={imageRef}
          image={image}
          x={slot.x + imagePos.x}
          y={slot.y + imagePos.y}
          width={slot.width}
          height={slot.height}
          scaleX={imageScale}
          scaleY={imageScale}
          draggable
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onClick={onSelect}
          onTap={onSelect}
        />
      )}
      {isSelected && image && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
