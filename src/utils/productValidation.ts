import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: "Product name must be at least 3 characters long" })
    .max(100, { message: "Product name must be less than 100 characters" }),
  
  price: z.number()
    .positive({ message: "Price must be greater than 0" })
    .min(0.01, { message: "Price must be greater than 0" }),
  
  original_price: z.number()
    .nullable()
    .optional()
    .refine((val) => val === null || val === undefined || val >= 0, {
      message: "Original price must be a positive number"
    }),
  
  stock_quantity: z.number()
    .int({ message: "Stock quantity must be a whole number" })
    .min(0, { message: "Stock quantity cannot be negative" }),
  
  category_id: z.string()
    .uuid({ message: "Please select a category" })
    .min(1, { message: "Category is required" }),
  
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
    .nullable(),
  
  images: z.array(z.object({
    url: z.string().url({ message: "Invalid image URL" }),
    is_main: z.boolean()
  }))
    .min(1, { message: "At least one image is required" }),
  
  colors: z.array(z.string()).optional().nullable(),
  handle_types: z.array(z.string()).optional().nullable(),
  in_stock: z.boolean(),
  featured: z.boolean()
}).refine((data) => {
  if (data.original_price && data.price) {
    return data.original_price > data.price;
  }
  return true;
}, {
  message: "Original price must be greater than current price",
  path: ["original_price"]
});

export type ProductFormData = z.infer<typeof productSchema>;
