import { useState, useCallback, useMemo } from 'react';
import { sanitizeInput, validateEmail, validatePhone, generateCSRFToken } from '@/middleware/securityMiddleware';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface FormSecurityOptions {
  enableCSRF?: boolean;
  enableSanitization?: boolean;
  enableRateLimit?: boolean;
  maxSubmissions?: number;
  rateLimitWindow?: number;
}

interface FormSubmission {
  timestamp: number;
  count: number;
}

export const useFormSecurity = (options: FormSecurityOptions = {}) => {
  const {
    enableCSRF = true,
    enableSanitization = true,
    enableRateLimit = true,
    maxSubmissions = 5,
    rateLimitWindow = 60000, // 1 minute
  } = options;

  const [csrfToken] = useState(() => enableCSRF ? generateCSRFToken() : '');
  const [submissions, setSubmissions] = useState<FormSubmission>({ timestamp: Date.now(), count: 0 });

  // Rate limiting check
  const checkRateLimit = useCallback((): boolean => {
    if (!enableRateLimit) return true;

    const now = Date.now();
    
    // Reset if window has passed
    if (now - submissions.timestamp > rateLimitWindow) {
      setSubmissions({ timestamp: now, count: 0 });
      return true;
    }

    if (submissions.count >= maxSubmissions) {
      toast.error(`Too many submissions. Please wait ${Math.ceil((rateLimitWindow - (now - submissions.timestamp)) / 1000)} seconds.`);
      return false;
    }

    return true;
  }, [submissions, enableRateLimit, maxSubmissions, rateLimitWindow]);

  // Increment submission count
  const recordSubmission = useCallback(() => {
    if (enableRateLimit) {
      setSubmissions(prev => ({ ...prev, count: prev.count + 1 }));
    }
  }, [enableRateLimit]);

  // Sanitize form data
  const sanitizeFormData = useCallback((data: Record<string, any>): Record<string, any> => {
    if (!enableSanitization) return data;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeInput(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }, [enableSanitization]);

  // Validate common form fields
  const validateFormField = useCallback((fieldName: string, value: string): { isValid: boolean; error?: string } => {
    switch (fieldName.toLowerCase()) {
      case 'email':
        return validateEmail(value) 
          ? { isValid: true } 
          : { isValid: false, error: 'Please enter a valid email address' };
          
      case 'phone':
        return validatePhone(value) 
          ? { isValid: true } 
          : { isValid: false, error: 'Please enter a valid phone number' };
          
      case 'name':
      case 'firstname':
      case 'lastname':
        return value.trim().length >= 2 
          ? { isValid: true } 
          : { isValid: false, error: 'Name must be at least 2 characters long' };
          
      case 'address':
        return value.trim().length >= 10 
          ? { isValid: true } 
          : { isValid: false, error: 'Please enter a complete address' };
          
      case 'zipcode':
      case 'postalcode':
        return /^\d{5}(-\d{4})?$/.test(value) 
          ? { isValid: true } 
          : { isValid: false, error: 'Please enter a valid zip code' };
          
      default:
        return { isValid: true };
    }
  }, []);

  // Secure form submission handler
  const secureSubmit = useCallback(async (
    formData: Record<string, any>,
    submitFn: (data: Record<string, any>) => Promise<void>,
    providedCSRFToken?: string
  ) => {
    try {
      // Check rate limit
      if (!checkRateLimit()) {
        return false;
      }

      // Validate CSRF token
      if (enableCSRF && providedCSRFToken !== csrfToken) {
        toast.error('Security validation failed. Please refresh and try again.');
        return false;
      }

      // Sanitize data
      const sanitizedData = sanitizeFormData(formData);

      // Validate required fields
      const validationErrors: string[] = [];
      for (const [key, value] of Object.entries(sanitizedData)) {
        if (typeof value === 'string' && value.trim()) {
          const validation = validateFormField(key, value);
          if (!validation.isValid && validation.error) {
            validationErrors.push(validation.error);
          }
        }
      }

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        return false;
      }

      // Record submission
      recordSubmission();

      // Submit form
      await submitFn(sanitizedData);
      return true;
    } catch (error) {
      logger.error('Form submission error:', error);
      toast.error('An error occurred while submitting the form');
      return false;
    }
  }, [checkRateLimit, csrfToken, enableCSRF, sanitizeFormData, validateFormField, recordSubmission]);

  // Generate honeypot field (bot detection)
  const honeypotField = useMemo(() => ({
    name: 'website_url', // Common spam field name
    style: { 
      position: 'absolute' as const, 
      left: '-9999px', 
      opacity: 0, 
      pointerEvents: 'none' as const 
    },
    tabIndex: -1,
    autoComplete: 'off',
  }), []);

  return {
    csrfToken,
    secureSubmit,
    sanitizeFormData,
    validateFormField,
    checkRateLimit,
    honeypotField,
    submissionCount: submissions.count,
    canSubmit: submissions.count < maxSubmissions,
  };
};