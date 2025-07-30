import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    
    // Simulate form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-deep-rose mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our handcrafted bags or need a custom order? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-2xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-lg mb-2">WhatsApp</h3>
                    <p className="text-muted-foreground mb-3">
                      For quick responses and custom orders
                    </p>
                    <Button 
                      variant="boutique" 
                      size="sm"
                      onClick={() => window.open('https://wa.me/15551234567', '_blank')}
                    >
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <Mail className="w-6 h-6 text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-lg mb-2">Email</h3>
                    <p className="text-muted-foreground">hello@lulibeads.com</p>
                    <p className="text-muted-foreground">orders@lulibeads.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <Phone className="w-6 h-6 text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-lg mb-2">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <Clock className="w-6 h-6 text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-lg mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                      <p className="text-muted-foreground">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-lg mb-2">Studio Location</h3>
                    <p className="text-muted-foreground">
                      123 Artisan Street<br />
                      Creative District<br />
                      New York, NY 10001
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      By appointment only
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-playfair font-bold text-deep-rose text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair font-semibold mb-3">How long does custom embroidery take?</h3>
                <p className="text-muted-foreground">
                  Custom name embroidery typically takes 2-3 business days to complete. 
                  We'll notify you when your order is ready for shipping.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair font-semibold mb-3">Do you ship internationally?</h3>
                <p className="text-muted-foreground">
                  Yes! We ship worldwide. International shipping times vary by location, 
                  typically 7-14 business days with tracking included.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair font-semibold mb-3">Can I request a custom design?</h3>
                <p className="text-muted-foreground">
                  Absolutely! We love creating unique pieces. Contact us with your ideas 
                  and we'll work together to bring your vision to life.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-playfair font-semibold mb-3">What's your return policy?</h3>
                <p className="text-muted-foreground">
                  We offer a 30-day return policy for non-customized items. 
                  Custom embroidered pieces are final sale unless defective.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;