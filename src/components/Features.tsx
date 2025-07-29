import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  Heart, 
  Truck, 
  Shield, 
  Palette, 
  Gift,
  Clock,
  Award
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Handcrafted Excellence",
      description: "Each bag is meticulously crafted by skilled artisans with attention to every detail.",
      color: "text-rose-gold"
    },
    {
      icon: Palette,
      title: "Custom Personalization",
      description: "Add your name or initials to create a truly unique piece that's exclusively yours.",
      color: "text-deep-rose"
    },
    {
      icon: Heart,
      title: "Premium Materials",
      description: "We use only the finest beads, fabrics, and hardware to ensure lasting beauty.",
      color: "text-rose-gold"
    },
    {
      icon: Truck,
      title: "Free Worldwide Shipping",
      description: "Complimentary shipping on all orders over $100 with secure, tracked delivery.",
      color: "text-deep-rose"
    },
    {
      icon: Clock,
      title: "Made to Order",
      description: "Your bag is crafted specially for you, ensuring freshness and quality.",
      color: "text-rose-gold"
    },
    {
      icon: Shield,
      title: "Lifetime Care",
      description: "We provide lifetime support and care instructions for your precious bag.",
      color: "text-deep-rose"
    },
    {
      icon: Gift,
      title: "Luxury Packaging",
      description: "Every purchase comes beautifully packaged, perfect for gifting or keeping.",
      color: "text-rose-gold"
    },
    {
      icon: Award,
      title: "Satisfaction Guarantee",
      description: "Not completely satisfied? We offer 30-day returns for peace of mind.",
      color: "text-deep-rose"
    }
  ];

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-deep-rose mb-4">
            The Luli Beads Experience
          </h2>
          <p className="text-lg text-muted-foreground font-montserrat max-w-2xl mx-auto">
            Every detail matters in creating your perfect handbag. Discover what makes 
            our craftsmanship special and our service exceptional.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 text-center hover:shadow-elegant transition-all duration-300 transform hover:scale-[1.02] border-0 bg-card/50 backdrop-blur-sm animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-luxury-pink group-hover:bg-rose-gold/10 transition-colors duration-300">
                    <IconComponent className={`h-6 w-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                
                <h3 className="font-playfair font-semibold text-foreground mb-2 text-lg">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground font-montserrat leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-rose-gold font-montserrat font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Experience luxury craftsmanship today</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;