// Types for custom orders feature
export interface CustomOrder {
  id: string;
  user_id: string;
  product_name: string;
  description?: string;
  personalization_details: PersonalizationDetails;
  preferred_colors?: string[];
  preferred_handles?: string[];
  budget_range?: string;
  delivery_date?: string;
  reference_images?: string[];
  status: CustomOrderStatus;
  admin_notes?: string;
  estimated_price?: number;
  final_price?: number;
  converted_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalizationDetails {
  custom_name?: string;
  special_requests?: string;
  font_style?: string;
  placement?: string;
  additional_features?: string[];
}

export type CustomOrderStatus = 
  | 'pending' 
  | 'in_review' 
  | 'approved' 
  | 'in_production' 
  | 'completed' 
  | 'cancelled';

export interface CreateCustomOrderInput {
  product_name: string;
  description?: string;
  personalization_details: PersonalizationDetails;
  preferred_colors?: string[];
  preferred_handles?: string[];
  budget_range?: string;
  delivery_date?: string;
  reference_images?: string[];
}

export interface UpdateCustomOrderInput {
  id: string;
  product_name?: string;
  description?: string;
  personalization_details?: PersonalizationDetails;
  preferred_colors?: string[];
  preferred_handles?: string[];
  budget_range?: string;
  delivery_date?: string;
  reference_images?: string[];
  status?: CustomOrderStatus;
  admin_notes?: string;
  estimated_price?: number;
  final_price?: number;
}

export const getStatusLabel = (status: CustomOrderStatus): string => {
  const labels: Record<CustomOrderStatus, string> = {
    pending: 'Pending Review',
    in_review: 'Under Review',
    approved: 'Approved',
    in_production: 'In Production',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status];
};

export const getStatusColor = (status: CustomOrderStatus): string => {
  const colors: Record<CustomOrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    in_production: 'bg-purple-100 text-purple-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status];
};