import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { ProductDisplay } from '@/types/product';

const ProductGrid = () => {
  const { products, isLoading } = useProducts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) return false;
    if (selectedProductType !== 'all' && product.productType !== selectedProductType) return false;
    if (selectedColor !== 'all' && !product.colors.includes(selectedColor)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background" id="shop">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-deep-rose mb-4">
              Our Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading our beautiful handcrafted beaded bags...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-80 rounded-2xl mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background" id="shop">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-deep-rose mb-4">
            Our Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover our exquisite handcrafted beaded bags. Choose from our ready-to-order standard collection or create something truly unique with our personalized custom designs.
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-gold rounded-full"></div>
              <span>Standard: Basic customization (color, handle)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-deep-rose rounded-full"></div>
              <span>Personalized: Full customization with names & special requests</span>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-wrap gap-4">
            <Select value={selectedProductType} onValueChange={setSelectedProductType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="custom">Personalized</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="bridal">Bridal</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                <SelectItem value="Black">Black</SelectItem>
                <SelectItem value="White">White</SelectItem>
                <SelectItem value="Rose Gold">Rose Gold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {products.length === 0 
                ? "No products available at the moment." 
                : "No products found matching your filters."
              }
            </p>
            {filteredProducts.length === 0 && products.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedProductType('all');
                  setSelectedColor('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.images[0] || '/placeholder.svg'}
                category={product.categoryId}
                productType={product.productType}
                isNew={false}
                isBestseller={false}
                colors={product.colors}
                handleTypes={product.handleTypes}
                inStock={product.inStock}
                stockQuantity={product.stockQuantity}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;