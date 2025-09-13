import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useOffline } from "@/hooks/useOffline";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  usePerformanceMonitor('Index');
  const { isOnline, isReconnecting } = useOffline();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Luli Beads",
    "description": "Luxury handmade beaded bags and accessories",
    "url": window.location.origin,
    "logo": `${window.location.origin}/images/logo.png`,
    "sameAs": [
      "https://instagram.com/lulibeads",
      "https://facebook.com/lulibeads"
    ]
  };

  return (
    <>
      <SEOHead
        title="Luli Beads - Luxury Handmade Beaded Bags & Accessories"
        description="Discover exquisite handmade beaded bags and accessories at Luli Beads. Premium quality, artisan crafted designs for the discerning fashion enthusiast."
        keywords="beaded bags, handmade bags, luxury accessories, artisan bags, fashion bags, beadwork, premium handbags"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background font-body">
        {!isOnline && (
          <Alert className="rounded-none border-x-0 border-t-0 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              You're offline. Some features may be limited.
              {isReconnecting && (
                <span className="flex items-center gap-1">
                  <Wifi className="h-4 w-4 animate-pulse" />
                  Reconnecting...
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Header />
        <main>
          <Hero />
          <section id="shop" aria-label="Product catalog">
            <ProductGrid />
          </section>
          <Features />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
