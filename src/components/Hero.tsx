import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-bags.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12 lg:py-20">
          
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-gold">
                <Sparkles className="h-5 w-5" />
                <span className="font-montserrat font-medium text-sm tracking-wide uppercase">
                  Handcrafted Luxury
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-deep-rose leading-tight">
                Exquisite Beaded
                <span className="block text-rose-gold">Handbags</span>
              </h1>
              
              <p className="text-lg text-muted-foreground font-montserrat max-w-lg leading-relaxed">
                Discover our collection of uniquely handcrafted beaded bags. 
                Each piece is carefully made with premium materials and can be 
                personalized with your name.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Collection
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="boutique" 
                size="xl"
                onClick={() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Custom Orders
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-playfair font-bold text-rose-gold">500+</div>
                <div className="text-sm text-muted-foreground font-montserrat">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-playfair font-bold text-rose-gold">100%</div>
                <div className="text-sm text-muted-foreground font-montserrat">Handmade</div>
              </div>
              <div>
                <div className="text-2xl font-playfair font-bold text-rose-gold">Premium</div>
                <div className="text-sm text-muted-foreground font-montserrat">Quality</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-luxury animate-scale-in">
              <img
                src={heroImage}
                alt="Luxury handcrafted beaded bags"
                className="w-full h-[500px] lg:h-[600px] object-cover hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Badge */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-elegant animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-gold rounded-full animate-pulse"></div>
                  <span className="text-sm font-montserrat font-medium text-deep-rose">
                    New Collection
                  </span>
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-gold/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-luxury-pink rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-pink/30 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default Hero;