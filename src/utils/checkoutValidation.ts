import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  
  firstName: z.string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "First name contains invalid characters" }),
  
  lastName: z.string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Last name contains invalid characters" }),
  
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[\d\s()+-]+$/, { message: "Invalid phone number format" }),
  
  address: z.string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" }),
  
  city: z.string()
    .trim()
    .min(2, { message: "City must be at least 2 characters" })
    .max(100, { message: "City must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "City contains invalid characters" }),
  
  postalCode: z.string()
    .trim()
    .min(3, { message: "Postal code must be at least 3 characters" })
    .max(15, { message: "Postal code must be less than 15 characters" })
    .regex(/^[A-Za-z0-9\s-]+$/, { message: "Invalid postal code format" }),
  
  notes: z.string()
    .trim()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional()
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
