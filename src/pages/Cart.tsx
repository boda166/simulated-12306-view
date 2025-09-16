import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { cartSummary, updateQuantity, removeItem, clearCart, isLoading, refreshCart } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');

  const { items: displayItems, subtotal, shipping, total, isEmpty } = cartSummary;

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      await updateQuantity(id, newQuantity);
      toast({
        title: "Cart Updated",
        description: newQuantity === 0 ? "Item removed from cart" : "Quantity updated",
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-playfair font-bold text-deep-rose mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some beautiful handcrafted bags to get started.</p>
            <Link to="/#shop">
              <Button variant="hero" size="lg">Continue Shopping</Button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-deep-rose mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">Review your items and proceed to checkout</p>
            </div>
            <Button
              variant="outline"
              onClick={refreshCart}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {displayItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                   <div className="flex gap-4">
                     <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-subtle">
                       <img
                         src={item.productImage}
                         alt={item.productName}
                         className="w-full h-full object-cover"
                       />
                     </div>
                     
                     <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-playfair font-semibold text-lg">{item.productName}</h3>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => handleRemoveItem(item.id)}
                           className="text-muted-foreground hover:text-destructive"
                           disabled={isLoading}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                       
                       <div className="space-y-1 text-sm text-muted-foreground mb-4">
                         {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                         {item.selectedHandle && <p>Handle: {item.selectedHandle}</p>}
                         {item.customName && <p>Custom Name: {item.customName}</p>}
                       </div>

                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="h-8 w-8"
                              disabled={isLoading || item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                              disabled={isLoading}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                         </div>
                         <div className="text-right">
                           <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                           <p className="text-sm text-muted-foreground">${item.productPrice.toFixed(2)} each</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="font-playfair font-semibold text-lg mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-sm text-rose-gold">Free shipping on orders over $100!</p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Coupon Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (couponCode.trim()) {
                          toast({
                            title: "Coupon Applied",
                            description: "Coupon functionality coming soon!",
                          });
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                  <Link to="/checkout">
                    <Button variant="hero" size="lg" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link to="/#shop">
                    <Button variant="boutique" size="lg" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;