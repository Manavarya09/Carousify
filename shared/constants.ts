export const CANVAS_CONFIG = {
  WIDTH: 3050,
  HEIGHT: 1350,
  EXPORT_WIDTH: 1080,
  EXPORT_HEIGHT: 1350,
} as const;

export const COLORS = {
  CREAM: {
    50: '#FDFBF7',
    100: '#FAF5EB',
    200: '#F5EBD8',
    300: '#EFDCC0',
    400: '#E6C9A3',
  },
  LAVENDER: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
  },
  BABY_BLUE: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
  },
  BLUSH: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
  },
} as const;

export const TEMPLATE_CATEGORIES = [
  'all',
  'grid',
  'vertical',
  'asymmetrical',
  'split',
  'strip',
  'creative',
] as const;

export const EXPORT_FORMATS = ['png', 'jpg'] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
