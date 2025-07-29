import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Users, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Handcrafted with Love',
      description: 'Every bead is carefully selected and placed by hand, ensuring each bag is unique and made with passion.'
    },
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'We use only the finest materials - from lustrous beads to durable threads and elegant hardware.'
    },
    {
      icon: Users,
      title: 'Personal Touch',
      description: 'Each bag can be personalized with custom embroidery, making it truly yours or a perfect gift.'
    },
    {
      icon: Award,
      title: 'Artisan Excellence',
      description: 'Our skilled artisans bring decades of experience to create bags that are both beautiful and durable.'
    }
  ];

  const timeline = [
    { year: '2020', event: 'Founded Luli Beads with a passion for handcrafted accessories' },
    { year: '2021', event: 'Launched our first collection on Instagram, gaining 10K followers' },
    { year: '2022', event: 'Introduced custom embroidery services' },
    { year: '2023', event: 'Expanded to offer international shipping' },
    { year: '2024', event: 'Launched our e-commerce platform for seamless shopping' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="bg-rose-gold/10 text-rose-gold mb-6">
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-deep-rose mb-6">
                Crafted with Passion,<br />Designed for You
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                At Luli Beads, we believe that accessories should tell a story. Every bag we create 
                is a testament to traditional craftsmanship, modern design, and the personal touch 
                that makes each piece uniquely yours.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-deep-rose mb-6">
                  The Beginning of Our Journey
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    It all started with a simple idea: to create beautiful, handcrafted accessories 
                    that celebrate individuality and craftsmanship. What began as a passion project 
                    in 2020 has grown into a beloved brand that serves customers worldwide.
                  </p>
                  <p>
                    Our founder, inspired by traditional beadwork techniques passed down through 
                    generations, combined these time-honored methods with contemporary design sensibilities. 
                    The result? Stunning beaded bags that are both timeless and thoroughly modern.
                  </p>
                  <p>
                    Every Luli Beads creation starts with carefully selected premium beads, chosen 
                    for their quality, color, and luster. Our skilled artisans then meticulously 
                    hand-craft each piece, ensuring that no two bags are exactly alike.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-rose rounded-lg"></div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-luxury rounded-lg"></div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4 mt-8">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-subtle rounded-lg"></div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-rose-gold/20 rounded-lg"></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-playfair font-bold text-deep-rose mb-4">
                What We Stand For
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our values guide everything we do, from the materials we choose to the way we treat our customers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-rose-gold" />
                    </div>
                    <h3 className="font-playfair font-semibold text-lg mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-playfair font-bold text-deep-rose mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From a small passion project to a global brand, here's how we've grown.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-rose-gold rounded-full"></div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-16 bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <Badge variant="secondary" className="bg-rose-gold/10 text-rose-gold mb-2">
                        {item.year}
                      </Badge>
                      <p className="text-muted-foreground">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-rose">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-playfair font-bold text-white mb-4">
              Ready to Find Your Perfect Bag?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Explore our collection of handcrafted beaded bags and discover the perfect piece 
              that tells your unique story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#shop">
                <Button variant="boutique" size="lg" className="bg-white text-deep-rose hover:bg-white/90">
                  Shop Collection
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Custom Orders
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;