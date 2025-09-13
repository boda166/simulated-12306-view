import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Luli Beads - Luxury Handmade Beaded Bags',
  description = 'Discover exquisite handmade beaded bags and accessories at Luli Beads. Premium quality, artisan crafted designs for the discerning fashion enthusiast.',
  keywords = 'beaded bags, handmade bags, luxury accessories, artisan bags, fashion bags, beadwork, premium handbags',
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  structuredData,
}) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  const fullTitle = title.includes('Luli Beads') ? title : `${title} | Luli Beads`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'Luli Beads', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Additional SEO tags
    updateMetaTag('author', 'Luli Beads');
    updateMetaTag('theme-color', '#D4A574'); // Rose gold color

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', currentUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let structuredDataElement = document.querySelector('#structured-data');
      if (!structuredDataElement) {
        structuredDataElement = document.createElement('script');
        structuredDataElement.setAttribute('type', 'application/ld+json');
        structuredDataElement.setAttribute('id', 'structured-data');
        document.head.appendChild(structuredDataElement);
      }
      structuredDataElement.textContent = JSON.stringify(structuredData);
    }

    // Default structured data for website
    if (!structuredData && type === 'website') {
      const defaultStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Luli Beads",
        "description": description,
        "url": currentUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };

      let structuredDataElement = document.querySelector('#structured-data');
      if (!structuredDataElement) {
        structuredDataElement = document.createElement('script');
        structuredDataElement.setAttribute('type', 'application/ld+json');
        structuredDataElement.setAttribute('id', 'structured-data');
        document.head.appendChild(structuredDataElement);
      }
      structuredDataElement.textContent = JSON.stringify(defaultStructuredData);
    }

  }, [fullTitle, description, keywords, image, currentUrl, type, structuredData]);

  return null; // This component only manages head elements
};

export default SEOHead;