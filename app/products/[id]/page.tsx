'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  materials: string;
  dimensions: string;
  weight: number;
  artist_name: string;
  artist_bio: string;
  cultural_origin: string;
  creation_story: string;
  care_instructions: string;
  instagram_media_id: string;
  instagram_post_url: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductInquiry {
  id: number;
  product_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  instagram_username?: string;
  message: string;
  inquiry_type: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    instagram_username: '',
    message: '',
    inquiry_type: 'PURCHASE'
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
        setInquiries(data.inquiries || []);
      } else {
        setError(data.error || 'Failed to load product');
      }
    } catch (err) {
      setError('Failed to load product');
      console.error('Product fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inquiryForm,
          product_id: product.id,
          source: 'PRODUCT_PAGE'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowInquiryForm(false);
        setInquiryForm({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          instagram_username: '',
          message: '',
          inquiry_type: 'PURCHASE'
        });
        // Refresh inquiries
        fetchProduct();
        alert('Your inquiry has been sent successfully!');
      } else {
        alert('Failed to send inquiry: ' + data.error);
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      alert('Failed to send inquiry');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p>{error || 'The requested product could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="p-6">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              
              {product.instagram_post_url && (
                <div className="mt-4">
                  <a
                    href={product.instagram_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                      <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    View on Instagram
                  </a>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-green-600">
                  {product.currency} {product.price}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Category</h3>
                    <p className="text-gray-600">{product.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Materials</h3>
                    <p className="text-gray-600">{product.materials}</p>
                  </div>
                </div>

                {product.dimensions && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Dimensions</h3>
                    <p className="text-gray-600">{product.dimensions}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-700">Artist</h3>
                  <p className="text-gray-600 font-medium">{product.artist_name}</p>
                  {product.artist_bio && (
                    <p className="text-gray-600 text-sm mt-1">{product.artist_bio}</p>
                  )}
                </div>

                {product.cultural_origin && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Cultural Origin</h3>
                    <p className="text-gray-600">{product.cultural_origin}</p>
                  </div>
                )}

                {product.creation_story && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Creation Story</h3>
                    <p className="text-gray-600">{product.creation_story}</p>
                  </div>
                )}

                {product.care_instructions && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Care Instructions</h3>
                    <p className="text-gray-600">{product.care_instructions}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  Inquire About This Product
                </Button>
                
                <Button
                  onClick={() => window.open(`https://wa.me/?text=Hi! I'm interested in ${product.name} - ${window.location.href}`, '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  Share via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Inquire About {product.name}</h2>
              
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.customer_name}
                    onChange={(e) => setInquiryForm({...inquiryForm, customer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.customer_email}
                    onChange={(e) => setInquiryForm({...inquiryForm, customer_email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={inquiryForm.customer_phone}
                    onChange={(e) => setInquiryForm({...inquiryForm, customer_phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram Username
                  </label>
                  <input
                    type="text"
                    value={inquiryForm.instagram_username}
                    onChange={(e) => setInquiryForm({...inquiryForm, instagram_username: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Type
                  </label>
                  <select
                    value={inquiryForm.inquiry_type}
                    onChange={(e) => setInquiryForm({...inquiryForm, inquiry_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PURCHASE">Purchase Inquiry</option>
                    <option value="CUSTOM">Custom Order</option>
                    <option value="WHOLESALE">Wholesale Inquiry</option>
                    <option value="GENERAL">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your interest in this product..."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send Inquiry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
