import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Menu, X, Search, Heart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { SearchDialog } from "./SearchDialog";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, signOut, initializeAuth } = useAuthStore();
  const { totalItems, syncWithDatabase } = useCartStore();
  const { syncWithDatabase: syncWishlist } = useWishlistStore();

  useEffect(() => {
    initializeAuth();
    if (isAuthenticated) {
      syncWithDatabase();
      syncWishlist();
    }
  }, [initializeAuth, isAuthenticated, syncWithDatabase, syncWishlist]);

  const handleLogout = async () => {
    await signOut();
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
            {/* Account and Admin links */}
            {isAuthenticated && (
              <>
                <Link
                  to="/account"
                  className="text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200 relative group"
                >
                  Account
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200 relative group"
                  >
                    Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-gold transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex hover:text-rose-gold"
              onClick={() => isAuthenticated ? setIsSearchOpen(true) : navigate('/auth')}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex hover:text-rose-gold"
              onClick={() => isAuthenticated ? navigate('/wishlist') : navigate('/auth')}
            >
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
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-rose-gold text-white text-xs">
                  {totalItems}
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
              {/* Account and Admin links in mobile menu */}
              {isAuthenticated && (
                <>
                  <Link
                    to="/account"
                    className="block px-3 py-2 text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-foreground hover:text-rose-gold font-montserrat font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              <div className="flex space-x-4 px-3 pt-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:text-rose-gold"
                  onClick={() => {
                    if (isAuthenticated) {
                      setIsSearchOpen(true);
                      setIsMenuOpen(false);
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:text-rose-gold"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/wishlist');
                      setIsMenuOpen(false);
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
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
      
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};

export default Header;