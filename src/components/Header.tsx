import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Menu, X, Search, Heart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { authAPI, cartAPI } from "@/lib/api";
import { toast } from "sonner";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const { user, isAuthenticated, clearUser } = useAuthStore();

  useEffect(() => {
    // Fetch cart count when user is authenticated
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const cartItems = await cartAPI.get();
      setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    clearUser();
    setCartCount(0);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navigation = [
    { name: "Home", href: "/", isLink: true },
    { name: "Shop", href: "/#shop", isShopLink: true },
    { name: "About", href: "/about", isLink: true },
    { name: "Contact", href: "/contact", isLink: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-playfair font-bold text-deep-rose">
              Luli Beads
            </h1>
            <p className="text-xs text-muted-foreground font-montserrat">
              Handcrafted Luxury
            </p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              item.isShopLink ? (
                <button
                  key={item.name}
                  onClick={() => {
                    if (window.location.pathname === '/') {
                      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/#shop';
                    }
                  }}
                  className="text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-gold transition-all duration-300 group-hover:w-full"></span>
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )
            ))}
            {/* Admin link - only show for admin users */}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200 relative group"
              >
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-rose-gold">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-rose-gold">
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex hover:text-rose-gold"
              onClick={() => isAuthenticated ? handleLogout() : navigate('/auth')}
            >
              {isAuthenticated ? <LogOut className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:text-rose-gold"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-rose-gold text-white text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                item.isShopLink ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (window.location.pathname === '/') {
                        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = '/#shop';
                      }
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              {/* Admin link in mobile menu - only for admin users */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="flex space-x-4 px-3 pt-4">
                <Button variant="ghost" size="icon" className="hover:text-rose-gold">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-rose-gold">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:text-rose-gold"
                  onClick={() => isAuthenticated ? handleLogout() : navigate('/auth')}
                >
                  {isAuthenticated ? <LogOut className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;