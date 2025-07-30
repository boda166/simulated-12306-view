import { Product } from './api';
import productBlack from '@/assets/product-black-bag.jpg';
import productWhite from '@/assets/product-white-bag.jpg';
import productRose from '@/assets/product-rose-bag.jpg';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Midnight Elegance',
    price: 129,
    originalPrice: 159,
    description: 'Handcrafted with premium black beads and elegant finishing, this bag represents the perfect blend of traditional craftsmanship and modern design.',
    images: [productBlack, productWhite, productRose],
    categoryId: 'evening',
    inStock: true,
    stockQuantity: 15,
    colors: ['Black', 'White', 'Rose Gold'],
    handles: ['Pearl Chain', 'Gold Chain', 'Ribbon Drawstring'],
    features: ['Handmade with premium beads', 'Customizable with your name', 'Choice of handle types', 'Elegant gift packaging']
  },
  {
    id: '2',
    name: 'Pearl Dreams',
    price: 149,
    originalPrice: 179,
    description: 'Luxurious white pearl beading creates an ethereal beauty perfect for special occasions and elegant evenings.',
    images: [productWhite, productRose, productBlack],
    categoryId: 'bridal',
    inStock: true,
    stockQuantity: 12,
    colors: ['White', 'Rose Gold', 'Black'],
    handles: ['Pearl Chain', 'Gold Chain', 'Silk Ribbon'],
    features: ['Premium pearl beads', 'Bridal collection', 'Custom embroidery', 'Luxury packaging']
  },
  {
    id: '3',
    name: 'Rose Gold Glamour',
    price: 169,
    originalPrice: 199,
    description: 'Stunning rose gold beadwork that catches the light beautifully, perfect for making a statement at any occasion.',
    images: [productRose, productBlack, productWhite],
    categoryId: 'luxury',
    inStock: true,
    stockQuantity: 8,
    colors: ['Rose Gold', 'Black', 'White'],
    handles: ['Gold Chain', 'Pearl Chain', 'Beaded Handle'],
    features: ['Rose gold premium beads', 'Statement piece', 'Artisan crafted', 'Limited edition']
  },
  {
    id: '4',
    name: 'Classic Black Beauty',
    price: 119,
    originalPrice: 149,
    description: 'Timeless black beaded bag that complements any outfit. A versatile piece for day to night elegance.',
    images: [productBlack, productWhite, productRose],
    categoryId: 'classic',
    inStock: true,
    stockQuantity: 20,
    colors: ['Black', 'White', 'Rose Gold'],
    handles: ['Pearl Chain', 'Gold Chain', 'Leather Strap'],
    features: ['Versatile design', 'Day to night', 'Classic collection', 'Durable construction']
  }
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getAllProducts = (): Product[] => {
  return mockProducts;
};