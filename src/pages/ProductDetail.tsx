import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import productBlack from '@/assets/product-black-bag.jpg';
import productWhite from '@/assets/product-white-bag.jpg';
import productRose from '@/assets/product-rose-bag.jpg';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [customName, setCustomName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedHandle, setSelectedHandle] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in real app, fetch based on id
  const product = {
    id: '1',
    name: 'Midnight Elegance',
    price: 129,
    originalPrice: 159,
    images: [productBlack, productWhite, productRose],
    description: 'Handcrafted with premium beads and elegant finishing, this bag represents the perfect blend of traditional craftsmanship and modern design. Each piece is meticulously created by skilled artisans.',
    features: ['Handmade with premium beads', 'Customizable with your name', 'Choice of handle types', 'Elegant gift packaging'],
    colors: ['Black', 'White', 'Rose Gold'],
    handles: ['Pearl Chain', 'Gold Chain', 'Ribbon Drawstring'],
    inStock: true,
    estimatedDelivery: '3-5 business days'
  };

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Added to cart:', { id, customName, selectedColor, selectedHandle, quantity });
  };

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
                <Label className="text-base font-medium">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Handle Type</Label>
                <Select value={selectedHandle} onValueChange={setSelectedHandle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose handle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.handles.map((handle) => (
                      <SelectItem key={handle} value={handle}>{handle}</SelectItem>
                    ))}
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
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="px-4">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
              
              <Link to="/cart">
                <Button variant="boutique" size="lg" className="w-full">
                  Buy Now
                </Button>
              </Link>
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