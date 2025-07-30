import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-9xl font-playfair font-bold text-rose-gold/20 mb-4">404</div>
            <h1 className="text-4xl font-playfair font-bold text-deep-rose mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
          </div>

          <Card className="mb-8 shadow-elegant">
            <CardContent className="p-8">
              <h2 className="text-xl font-playfair font-semibold mb-6">What would you like to do?</h2>
              <div className="grid gap-4">
                <Link to="/">
                  <Button variant="hero" size="lg" className="w-full">
                    <Home className="w-5 h-5 mr-2" />
                    Go to Homepage
                  </Button>
                </Link>
                <Link to="/#shop">
                  <Button variant="boutique" size="lg" className="w-full">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Browse Products
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p>Error code: 404 | Path: {location.pathname}</p>
            <p className="mt-2">
              Need help? <Link to="/contact" className="text-rose-gold hover:underline">Contact our support team</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
