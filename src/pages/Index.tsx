import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Header />
      <main>
        <Hero />
        <section id="shop">
          <ProductGrid />
        </section>
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
