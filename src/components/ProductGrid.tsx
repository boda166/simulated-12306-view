import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "./ProductCard";
import { Filter, SlidersHorizontal, Grid3X3, Grid2X2 } from "lucide-react";
import productBlack from "@/assets/product-black-bag.jpg";
import productWhite from "@/assets/product-white-bag.jpg";
import productRose from "@/assets/product-rose-bag.jpg";

const ProductGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock product data
  const products = [
    {
      id: '1',
      name: 'Midnight Elegance',
      price: 129,
      originalPrice: 159,
      image: productBlack,
      category: 'Evening Bags',
      isNew: true,
      isBestseller: false,
      colors: ['#000000', '#1a1a1a', '#333333'],
      customizable: true,
    },
    {
      id: '2',
      name: 'Pearl Dreams',
      price: 149,
      image: productWhite,
      category: 'Classic Collection',
      isNew: false,
      isBestseller: true,
      colors: ['#ffffff', '#f8f8f8', '#e0e0e0', '#d4af37'],
      customizable: true,
    },
    {
      id: '3',
      name: 'Rose Gold Luxe',
      price: 179,
      image: productRose,
      category: 'Premium Line',
      isNew: true,
      isBestseller: true,
      colors: ['#e8b4b8', '#d4af37', '#f4c2a1'],
      customizable: true,
    },
    {
      id: '4',
      name: 'Crystal Nights',
      price: 199,
      image: productBlack,
      category: 'Evening Bags',
      isNew: false,
      isBestseller: false,
      colors: ['#000000', '#4a4a4a', '#c0c0c0'],
      customizable: true,
    },
    {
      id: '5',
      name: 'Ivory Grace',
      price: 135,
      originalPrice: 165,
      image: productWhite,
      category: 'Classic Collection',
      isNew: false,
      isBestseller: true,
      colors: ['#ffffff', '#f5f5dc', '#fff8dc'],
      customizable: true,
    },
    {
      id: '6',
      name: 'Champagne Glow',
      price: 189,
      image: productRose,
      category: 'Premium Line',
      isNew: true,
      isBestseller: false,
      colors: ['#f7e7ce', '#d4af37', '#e8b4b8'],
      customizable: true,
    },
  ];

  const filters = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'evening', name: 'Evening Bags', count: 2 },
    { id: 'classic', name: 'Classic', count: 2 },
    { id: 'premium', name: 'Premium', count: 2 },
    { id: 'new', name: 'New Arrivals', count: 3 },
    { id: 'bestseller', name: 'Bestsellers', count: 3 },
  ];

  const filteredProducts = products.filter(product => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'evening') return product.category === 'Evening Bags';
    if (selectedFilter === 'classic') return product.category === 'Classic Collection';
    if (selectedFilter === 'premium') return product.category === 'Premium Line';
    if (selectedFilter === 'new') return product.isNew;
    if (selectedFilter === 'bestseller') return product.isBestseller;
    return true;
  });

  return (
    <section id="shop" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-deep-rose mb-4">
            Our Collection
          </h2>
          <p className="text-lg text-muted-foreground font-montserrat max-w-2xl mx-auto">
            Discover our carefully curated selection of handcrafted beaded bags. 
            Each piece is unique and can be personalized to your style.
          </p>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "elegant" : "boutique"}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
                className="text-sm"
              >
                {filter.name}
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-white/80 text-deep-rose"
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'large' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('large')}
                className="rounded-none border-0 border-l border-border"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground font-montserrat">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-montserrat">
            <Filter className="h-4 w-4" />
            Sort by: Newest
          </div>
        </div>

        {/* Product Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              className="animate-fade-in"
            />
          ))}
        </div>

        {/* Load More */}
        {filteredProducts.length < products.length && (
          <div className="text-center mt-12">
            <Button variant="boutique" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;