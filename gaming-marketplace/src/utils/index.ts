// Utility functions for the Gaming Marketplace

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Format currency values
export const formatCurrency = (
  amount: number,
  currency: 'gold' | 'usd' | 'toman'
): string => {
  const symbols = {
    gold: 'G',
    usd: '$',
    toman: '﷼',
  };

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'gold' ? 0 : 2,
    maximumFractionDigits: currency === 'gold' ? 0 : 2,
  }).format(amount);

  return `${symbols[currency]}${formatted}`;
};

// Format dates
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Format relative time
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateObj);
};

// Validate file upload
export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PNG, JPG, and JPEG files are allowed',
    };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  return { isValid: true };
};

// Check image dimensions
export const checkImageDimensions = (
  file: File
): Promise<{ isValid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 800 || img.height < 600) {
        resolve({
          isValid: false,
          error: 'Image must be at least 800x600 pixels',
        });
      } else {
        resolve({ isValid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ isValid: false, error: 'Invalid image file' });
    };

    img.src = url;
  });
};

// Debounce function
export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Class name utility
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate game time code
export const generateGameTimeCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];

  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join('-');
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert to title case
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
