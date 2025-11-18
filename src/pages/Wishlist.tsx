import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items: wishlistItems, syncWithDatabase, removeFromWishlist, isLoading } = useWishlistStore();
  const { addItem } = useCart();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    syncWithDatabase();
  }, [isAuthenticated, navigate, syncWithDatabase]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('You must be logged in to manage wishlist');
    }
  };

  const handleAddToCart = async (item: any) => {
    try {
      await addItem({
        productId: item.productId,
        quantity: 1,
      });
      toast.success('Added to cart');
    } catch (error) {
      logger.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-playfair font-bold text-deep-rose mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">Save your favorite items for later by adding them to your wishlist.</p>
            <Link to="/#shop">
              <Button variant="hero" size="lg">Discover Products</Button>
            </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-playfair font-semibold text-lg mb-2 line-clamp-1">
                    {item.productName}
                  </h3>
                  <p className="text-lg font-semibold text-rose-gold mb-4">
                    ${item.productPrice.toFixed(2)}
                  </p>
                  
                  <div className="space-y-2">
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Link to={`/product/${item.productId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;