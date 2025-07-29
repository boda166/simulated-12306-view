import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Sparkles
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "#shop" },
      { name: "Evening Bags", href: "#evening" },
      { name: "Classic Collection", href: "#classic" },
      { name: "Premium Line", href: "#premium" },
      { name: "New Arrivals", href: "#new" },
      { name: "Bestsellers", href: "#bestsellers" }
    ],
    customer: [
      { name: "Size Guide", href: "#size-guide" },
      { name: "Care Instructions", href: "#care" },
      { name: "Shipping Info", href: "#shipping" },
      { name: "Returns", href: "#returns" },
      { name: "Track Order", href: "#track" },
      { name: "Contact Us", href: "#contact" }
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Our Story", href: "#story" },
      { name: "Craftsmanship", href: "#craft" },
      { name: "Sustainability", href: "#sustainability" },
      { name: "Press", href: "#press" },
      { name: "Careers", href: "#careers" }
    ]
  };

  return (
    <footer className="bg-deep-rose text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                Luli Beads
              </h3>
              <p className="text-rose-gold/80 font-montserrat text-sm">
                Handcrafted Luxury
              </p>
            </div>
            
            <p className="text-white/80 font-montserrat text-sm leading-relaxed">
              Creating unique, handcrafted beaded bags with love and attention 
              to detail. Each piece tells a story of craftsmanship and elegance.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-playfair font-semibold text-white mb-4 text-lg">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/70 hover:text-white font-montserrat text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-playfair font-semibold text-white mb-4 text-lg">
              Customer Care
            </h4>
            <ul className="space-y-3">
              {footerLinks.customer.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/70 hover:text-white font-montserrat text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h4 className="font-playfair font-semibold text-white mb-4 text-lg">
                Stay Connected
              </h4>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-white/70 text-sm font-montserrat">
                  <Mail className="h-4 w-4" />
                  <span>hello@lulibeads.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/70 text-sm font-montserrat">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-white/70 text-sm font-montserrat">
                  <MapPin className="h-4 w-4" />
                  <span>New York, NY</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="font-montserrat font-medium text-white mb-3">
                Newsletter
              </h5>
              <p className="text-white/70 text-sm font-montserrat mb-4">
                Get updates on new collections and exclusive offers.
              </p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-montserrat"
                />
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="bg-rose-gold hover:bg-rose-gold/90 text-white border-0"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white/70 text-sm font-montserrat">
              <span>© {currentYear} Luli Beads. Made with</span>
              <Heart className="h-4 w-4 text-rose-gold fill-current" />
              <span>in New York</span>
            </div>
            
            <div className="flex items-center gap-6 text-white/70 text-sm font-montserrat">
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-rose-gold" />
                <span>Handcrafted with Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;