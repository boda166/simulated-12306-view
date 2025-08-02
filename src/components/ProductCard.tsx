import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  colors?: string[];
  customizable?: boolean;
  className?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isNew = false,
  isBestseller = false,
  colors = [],
  customizable = true,
  className,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const isLiked = isInWishlist(id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await addItem({
        productId: id,
        productName: name,
        productPrice: price,
        productImage: image,
        quantity: 1,
      });
      
      toast({
        title: "Added to Cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your wishlist.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      if (isLiked) {
        await removeFromWishlist(id);
        toast({
          title: "Removed from Wishlist",
          description: `${name} has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist(id);
        toast({
          title: "Added to Wishlist",
          description: `${name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden border-0 shadow-soft hover:shadow-luxury transition-all duration-300 transform hover:scale-[1.02] bg-card",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-luxury-pink">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-rose-gold text-white font-montserrat text-xs">
              New
            </Badge>
          )}
          {isBestseller && (
            <Badge className="bg-deep-rose text-white font-montserrat text-xs">
              Bestseller
            </Badge>
          )}
          {customizable && (
            <Badge variant="outline" className="bg-white/80 text-deep-rose border-rose-gold font-montserrat text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Custom
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cn(
          "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 hover:bg-white text-foreground hover:text-rose-gold shadow-soft"
            onClick={handleToggleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current text-rose-gold")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 hover:bg-white text-foreground hover:text-rose-gold shadow-soft"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button
            variant="hero"
            size="lg"
            onClick={handleAddToCart}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-montserrat text-muted-foreground uppercase tracking-wide">
            {category}
          </p>
          <h3 className="font-playfair font-semibold text-foreground text-lg leading-tight">
            {name}
          </h3>
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex gap-1">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
            {colors.length > 4 && (
              <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">+{colors.length - 4}</span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-playfair font-bold text-deep-rose">
            ${price}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through font-montserrat">
              ${originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button for Mobile */}
        <Button
          variant="elegant"
          size="lg"
          className="w-full md:hidden"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;