class TranslationService {
  private cache = new Map<string, string>();
  private isTranslating = new Set<string>();
  
  async translateText(text: string, targetLang: 'hi' | 'en' = 'hi'): Promise<string> {
    if (!text || targetLang === 'en') return text;
    
    console.log('TranslationService: Translating text:', text, 'to', targetLang);
    
    const cacheKey = `${text}_${targetLang}`;
    
    // Return cached translation if available
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      console.log('TranslationService: Found cached translation:', text, '->', cached);
      return cached;
    }
    
    // Prevent duplicate requests for the same text
    if (this.isTranslating.has(cacheKey)) {
      // Wait a bit and check cache again
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.cache.get(cacheKey) || text;
    }
    
    this.isTranslating.add(cacheKey);
    
    try {
      console.log('TranslationService: Making API call for:', text);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const { translatedText } = await response.json();
      console.log('TranslationService: API returned:', text, '->', translatedText);
      
      this.cache.set(cacheKey, translatedText);
      return translatedText;
      
      // Cache the translation
      this.cache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    } finally {
      this.isTranslating.delete(cacheKey);
    }
  }

  async translateProduct(product: any, targetLang: 'hi' | 'en' = 'hi') {
    if (targetLang === 'en') return product;
    
    try {
      const [translatedName, translatedDescription] = await Promise.all([
        this.translateText(product.name, targetLang),
        product.description ? this.translateText(product.description, targetLang) : '',
      ]);

      return {
        ...product,
        name: translatedName,
        description: translatedDescription,
        // Keep original values for reference
        originalName: product.name,
        originalDescription: product.description,
      };
    } catch (error) {
      console.error('Product translation error:', error);
      return product; // Return original if translation fails
    }
  }

  async translateProducts(products: any[], targetLang: 'hi' | 'en' = 'hi'): Promise<any[]> {
    if (targetLang === 'en') return products;
    
    try {
      // Translate products in parallel for better performance
      const translatedProducts = await Promise.all(
        products.map(product => this.translateProduct(product, targetLang))
      );
      
      return translatedProducts;
    } catch (error) {
      console.error('Products translation error:', error);
      return products; // Return originals if translation fails
    }
  }

  // Method to translate activity messages
  async translateActivity(activity: any, targetLang: 'hi' | 'en' = 'hi') {
    if (targetLang === 'en') return activity;
    
    try {
      // Translate activity text while preserving product names, order IDs etc.
      let translatedText = activity.text || activity.message || '';
      
      // Simple activity translations
      const activityTranslations: Record<string, string> = {
        'New order': 'नया ऑर्डर',
        'received': 'प्राप्त',
        'Product': 'उत्पाद',
        'updated': 'अपडेट',
        'Order': 'ऑर्डर',
        'shipped': 'भेजा गया',
        'AI generated cultural story for': 'AI ने सांस्कृतिक कहानी बनाई',
        'minutes ago': 'मिनट पहले',
        'hour ago': 'घंटे पहले',
        'hours ago': 'घंटे पहले',
        'days ago': 'दिन पहले',
      };
      
      for (const [english, hindi] of Object.entries(activityTranslations)) {
        translatedText = translatedText.replace(new RegExp(english, 'gi'), hindi);
      }
      
      return {
        ...activity,
        text: translatedText,
        message: translatedText,
      };
    } catch (error) {
      console.error('Activity translation error:', error);
      return activity;
    }
  }

  // Preload common translations for better UX
  async preloadCommonTranslations() {
    const commonTerms = [
      'cricket bat', 'pottery', 'ball', 'active', 'inactive',
      'handmade', 'traditional', 'available', 'sold'
    ];
    
    await Promise.all(
      commonTerms.map(term => this.translateText(term, 'hi'))
    );
  }

  // Clear cache when needed (e.g., on logout or language reset)
  clearCache() {
    this.cache.clear();
  }

  // Get cache size for debugging
  getCacheSize() {
    return this.cache.size;
  }

  // Method to get cached translation without API call
  getCachedTranslation(text: string, targetLang: 'hi' | 'en' = 'hi'): string | null {
    const cacheKey = `${text}_${targetLang}`;
    return this.cache.get(cacheKey) || null;
  }
}

export const translationService = new TranslationService();

// Preload common translations on service initialization
if (typeof window !== 'undefined') {
  translationService.preloadCommonTranslations().catch(console.error);
}