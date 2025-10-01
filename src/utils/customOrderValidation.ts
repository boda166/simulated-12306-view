import { z } from 'zod';

export const customOrderSchema = z.object({
  product_name: z.string()
    .trim()
    .min(3, { message: "Product name must be at least 3 characters" })
    .max(200, { message: "Product name must be less than 200 characters" }),
  
  description: z.string()
    .trim()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .or(z.literal('')),
  
  personalization_details: z.object({
    custom_name: z.string()
      .trim()
      .max(100, { message: "Custom name must be less than 100 characters" })
      .optional()
      .or(z.literal('')),
    
    special_requests: z.string()
      .trim()
      .max(500, { message: "Special requests must be less than 500 characters" })
      .optional()
      .or(z.literal('')),
    
    font_style: z.string()
      .trim()
      .max(50, { message: "Font style must be less than 50 characters" })
      .optional()
      .or(z.literal('')),
    
    placement: z.string()
      .trim()
      .max(100, { message: "Placement must be less than 100 characters" })
      .optional()
      .or(z.literal('')),
    
    additional_features: z.array(z.string()).optional()
  }),
  
  budget_range: z.string()
    .trim()
    .max(50, { message: "Budget range must be less than 50 characters" })
    .optional()
    .or(z.literal('')),
  
  delivery_date: z.string()
    .optional()
    .or(z.literal('')),
  
  preferred_colors: z.array(z.string()).max(10, { message: "Maximum 10 colors allowed" }).optional(),
  preferred_handles: z.array(z.string()).max(10, { message: "Maximum 10 handle types allowed" }).optional()
});

export type CustomOrderFormData = z.infer<typeof customOrderSchema>;
