'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Image as ImageIcon,
  Sparkles,
  Package,
  DollarSign,
  Tag,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  name: string;
  description: string;
  story?: string;
  price: number;
  currency: string;
  image_url?: string;
  category: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setProducts([
          {
            id: 1,
            name: "Handwoven Cotton Scarf",
            description: "Beautiful traditional scarf with intricate patterns",
            story: "This scarf represents the ancient weaving traditions of rural artisans...",
            price: 1250.00,
            currency: "INR",
            image_url: "/placeholder-product.jpg",
            category: "Textiles",
            tags: ["handwoven", "cotton", "traditional"],
            is_active: true,
            created_at: "2024-01-15T10:30:00Z"
          },
          {
            id: 2,
            name: "Clay Pottery Bowl",
            description: "Hand-shaped ceramic bowl with natural glaze",
            price: 850.00,
            currency: "INR",
            category: "Pottery",
            tags: ["ceramic", "handmade", "functional"],
            is_active: true,
            created_at: "2024-01-20T14:15:00Z"
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading products:', error);
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Simulate API call
      setCategories([
        { id: 1, name: "Textiles", description: "Handwoven fabrics and clothing" },
        { id: 2, name: "Pottery", description: "Clay pottery and ceramics" },
        { id: 3, name: "Jewelry", description: "Handcrafted jewelry" },
        { id: 4, name: "Woodwork", description: "Carved wooden items" },
        { id: 5, name: "Metalwork", description: "Brass and copper crafts" }
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateStory = async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch('/api/mcp/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a cultural story for this product: ${product.name} - ${product.description}. Category: ${product.category}`,
          type: 'cultural_story'
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update product with generated story
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, story: result.result } : p
        ));
      }
    } catch (error) {
      console.error('Error generating story:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Products</h1>
          <p className="text-gray-400">Manage your artisan products with AI-powered features</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-gray-300"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-gray-300"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400">Loading products...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-500 transition-all">
              {/* Product Image */}
              <div className="h-48 bg-gray-800 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-gray-600" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-orange-400 truncate">{product.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-orange-400">
                    {product.currency} {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Story Indicator */}
                {product.story && (
                  <div className="flex items-center text-orange-400 text-sm mb-3">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>Cultural story generated</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-800 hover:text-orange-400 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-800 hover:text-orange-400 rounded">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:bg-red-500/20 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {!product.story && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateStory(product.id)}
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate Story
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-orange-400 mb-2">No products found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by adding your first product.'}
          </p>
          <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Add Product Modal - Basic placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 text-orange-400">Add New Product</h2>
            <p className="text-gray-400 mb-4">Product creation form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button onClick={() => setShowAddModal(false)} className="bg-orange-500 hover:bg-orange-600 text-black">
                Add Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
