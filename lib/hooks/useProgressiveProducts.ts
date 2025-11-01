import { useState, useEffect } from 'react';

interface LightProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface HeavyProductData {
  id: string;
  imageUrl?: string;
  description?: string;
  story?: string;
}

interface FullProduct extends LightProduct {
  imageUrl?: string;
  description?: string;
  story?: string;
  loading?: boolean;
}

export const useProgressiveProducts = (initialProducts: LightProduct[]) => {
  const [products, setProducts] = useState<FullProduct[]>(
    initialProducts.map(p => ({ ...p, loading: true }))
  );

  useEffect(() => {
    const fetchHeavyData = async () => {
      try {
        const productIds = initialProducts.map(p => p.id);
        
        const response = await fetch('/api/products/heavy-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productIds }),
        });

        if (response.ok) {
          const { heavyData } = await response.json();
          
          setProducts(prevProducts => 
            prevProducts.map(product => {
              const heavyInfo = heavyData.find((h: HeavyProductData) => h.id === product.id);
              return {
                ...product,
                ...heavyInfo,
                loading: false,
              };
            })
          );
        } else {
          // If heavy data fetch fails, just mark as not loading
          setProducts(prevProducts => 
            prevProducts.map(product => ({ ...product, loading: false }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch heavy product data:', error);
        setProducts(prevProducts => 
          prevProducts.map(product => ({ ...product, loading: false }))
        );
      }
    };

    if (initialProducts.length > 0) {
      fetchHeavyData();
    }
  }, [initialProducts]);

  return products;
};

export const useProgressiveProduct = (initialProduct: LightProduct) => {
  const [product, setProduct] = useState<FullProduct>({ ...initialProduct, loading: true });

  useEffect(() => {
    const fetchHeavyData = async () => {
      try {
        const response = await fetch('/api/products/heavy-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productIds: [initialProduct.id] }),
        });

        if (response.ok) {
          const { heavyData } = await response.json();
          const heavyInfo = heavyData[0];
          
          setProduct(prevProduct => ({
            ...prevProduct,
            ...heavyInfo,
            loading: false,
          }));
        } else {
          setProduct(prevProduct => ({ ...prevProduct, loading: false }));
        }
      } catch (error) {
        console.error('Failed to fetch heavy product data:', error);
        setProduct(prevProduct => ({ ...prevProduct, loading: false }));
      }
    };

    fetchHeavyData();
  }, [initialProduct.id]);

  return product;
};
