import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/stores/authStore';
import { useCart } from '@/hooks/useCart';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { ProductDisplay } from '@/types/product';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { toast: uiToast } = useToast();
  const { getProductById } = useProducts();
  const [selectedImage, setSelectedImage] = useState(0);
  const [customName, setCustomName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedHandle, setSelectedHandle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const productData = await getProductById(id);
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      navigate('/auth');
      return;
    }

    if (!product) return;

    // For custom products, redirect to custom order form
    if (product.productType === 'custom') {
      navigate('/custom-orders');
      return;
    }

    // For standard products, add to cart
    try {
      await addItem({
        productId: product.id,
        quantity,
        selectedColor: selectedColor || undefined,
        selectedHandle: selectedHandle || undefined,
        customName: customName || undefined
      });
      
      uiToast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      uiToast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      navigate('/auth');
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8 w-1/3"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-2xl"></div>
                <div className="flex gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-2/3"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-rose-gold transition-colors">Home</Link>
          <span>/</span>
          <Link to="/#shop" className="hover:text-rose-gold transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-subtle">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-rose-gold' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>
                <Badge variant="secondary" className="bg-rose-gold/10 text-rose-gold">
                  {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(127 reviews)</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="custom-name" className="text-base font-medium">Personalize with Name</Label>
                <Input
                  id="custom-name"
                  placeholder="Enter name for inner pouch (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Color <span className="text-muted-foreground text-sm">(Optional)</span></Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose color (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.length > 0 && product.colors[0] !== '' ? (
                      product.colors.map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                        <SelectItem value="Brown">Brown</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Handle Type <span className="text-muted-foreground text-sm">(Optional)</span></Label>
                <Select value={selectedHandle} onValueChange={setSelectedHandle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose handle type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.handles.length > 0 && product.handles[0] !== '' ? (
                      product.handles.map((handle) => (
                        <SelectItem key={handle} value={handle}>{handle}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Short Handle">Short Handle</SelectItem>
                        <SelectItem value="Long Handle">Long Handle</SelectItem>
                        <SelectItem value="Chain Handle">Chain Handle</SelectItem>
                        <SelectItem value="No Handle">No Handle</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Quantity</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || product.stockQuantity <= 0}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {!product.inStock || product.stockQuantity <= 0 
                    ? "Out of Stock" 
                    : product.productType === 'custom' 
                      ? "Create Custom Order" 
                      : "Add to Cart"
                  }
                </Button>
                <Button 
                  variant={isInWishlist(product.id) ? "default" : "outline"} 
                  size="lg" 
                  className="px-4"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <Button 
                variant="boutique" 
                size="lg" 
                className="w-full"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $100</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="text-sm font-medium">Quality Guarantee</p>
                <p className="text-xs text-muted-foreground">Handmade perfection</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;