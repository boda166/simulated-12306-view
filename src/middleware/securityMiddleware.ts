import { supabase } from '@/integrations/supabase/client';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// XSS Protection
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Rate Limiting
export const rateLimit = (
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000 // 1 minute
): boolean => {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const limit = rateLimitStore.get(key)!;
  
  if (now > limit.resetTime) {
    // Reset the window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  limit.count++;
  return true;
};

// Input Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  
  return { isValid: errors.length === 0, errors };
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// SQL Injection Prevention (for manual queries)
export const escapeSQL = (input: string): string => {
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\');
};

// Session Security
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at ? session.expires_at > now : false;
  } catch {
    return false;
  }
};

// Content Security Policy headers (for use in deployment)
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};