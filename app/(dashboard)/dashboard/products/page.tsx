"use client";

import { useState, useEffect } from "react";
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
  Search,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    currency: "INR",
    image_url: "",
    category: "Textiles",
    tags: "",
    is_active: true,
  });

  // Helper function to render currency icon
  const renderCurrencyIcon = (currency: string) => {
    if (currency === "INR") {
      return <IndianRupee className="h-4 w-4" />;
    } else if (currency === "$" || currency === "USD") {
      return <DollarSign className="h-4 w-4" />;
    } else {
      return currency;
    }
  };

  // Helper function to get story status text
  const getStoryStatusText = (productName: string) => {
    const storyTexts = [
      "Heritage story crafted",
      "Cultural narrative added",
      "Traditional story woven",
      "Artisan story captured",
      "Legacy story created",
    ];
    // Use product name hash to get consistent but different text for each product
    const hash = productName.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return storyTexts[hash % storyTexts.length];
  };

  // Modal handler functions
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      closeModals();
      // Here you would also make API call to delete from database
    }
  };

  // Add product functions
  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.description && newProduct.price) {
      try {
        const token = localStorage.getItem('accessToken');
        
        const productData = {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          currency: newProduct.currency,
          imageUrl: newProduct.image_url || undefined,
          category: newProduct.category,
          tags: newProduct.tags
            ? newProduct.tags.split(",").map((tag) => tag.trim())
            : [],
          isActive: newProduct.is_active,
        };

        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Reload products to get the latest data
            await loadProducts();
            resetAddForm();
            setShowAddModal(false);
            alert('Product added successfully!');
          } else {
            alert('Failed to add product: ' + data.error);
          }
        } else {
          alert('Failed to add product. Please try again.');
        }
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
      }
    }
  };

  const resetAddForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      currency: "INR",
      image_url: "",
      category: "Textiles",
      tags: "",
      is_active: true,
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetAddForm();
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the data to match the expected format
          const formattedProducts = data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            story: product.story,
            price: product.price,
            currency: product.currency || 'INR',
            image_url: product.imageUrl || product.image_url,
            category: product.category,
            tags: product.tags ? (Array.isArray(product.tags) ? product.tags : product.tags.split(',').map((t: string) => t.trim())) : [],
            is_active: product.isActive !== false,
            created_at: product.createdAt || product.created_at || new Date().toISOString(),
          }));
          setProducts(formattedProducts);
        } else {
          console.error('Failed to load products:', data.error);
          // Fallback to empty array
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', response.status);
        // Fallback to empty array
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      // Fallback to empty array
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Simulate API call
      setCategories([
        {
          id: 1,
          name: "Textiles",
          description: "Handwoven fabrics and clothing",
        },
        { id: 2, name: "Pottery", description: "Clay pottery and ceramics" },
        { id: 3, name: "Jewelry", description: "Handcrafted jewelry" },
        { id: 4, name: "Woodwork", description: "Carved wooden items" },
        { id: 5, name: "Metalwork", description: "Brass and copper crafts" },
      ]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateStory = async (productId: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      // Show loading state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, story: "Generating cultural story..." }
            : p
        )
      );

      // Simulate API delay and generate contextual story
      setTimeout(() => {
        const generatedStory = generateContextualStory(product);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, story: generatedStory } : p
          )
        );
      }, 2000);
    } catch (error) {
      console.error("Error generating story:", error);
      // Reset on error
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, story: undefined } : p))
      );
    }
  };

  // Helper function to generate contextual stories based on product details
  const generateContextualStory = (product: Product): string => {
    const getRandomLocation = (category: string) => {
      const locations: { [key: string]: string[] } = {
        textiles: [
          "Varanasi",
          "Kanchipuram",
          "Mysore",
          "Chanderi",
          "Maheshwar",
        ],
        pottery: ["Khurja", "Jaipur", "Pokhran", "Alwar", "Bikaner"],
        jewelry: ["Jaipur", "Hyderabad", "Kolhapur", "Nagercoil", "Thrissur"],
        woodwork: [
          "Mysore",
          "Saharanpur",
          "Hoshiarpur",
          "Channapatna",
          "Etikoppaka",
        ],
        metalwork: ["Moradabad", "Thanjavur", "Bidar", "Lucknow", "Jaipur"],
        paintings: [
          "Madhubani",
          "Warli",
          "Pattachitra",
          "Miniature",
          "Tanjore",
        ],
        default: ["ancient India", "traditional workshops", "heritage centers"],
      };
      const categoryLocations =
        locations[category.toLowerCase()] || locations.default;
      return categoryLocations[
        Math.floor(Math.random() * categoryLocations.length)
      ];
    };

    const getRandomYears = () => Math.floor(Math.random() * 400) + 200; // 200-600 years
    const getRandomGenerations = () => Math.floor(Math.random() * 8) + 3; // 3-10 generations
    const getRandomDays = () => Math.floor(Math.random() * 20) + 5; // 5-25 days

    const storyTemplates = {
      Textiles: [
        `Crafted in the traditional looms of ${getRandomLocation(
          "textiles"
        )}, this ${product.name.toLowerCase()} continues a ${getRandomYears()}-year-old weaving tradition. Each thread tells stories of ${getRandomGenerations()} generations of skilled artisans, making it a living piece of Indian heritage.`,

        `From the workshops of ${getRandomLocation(
          "textiles"
        )}, this beautiful ${product.name.toLowerCase()} represents ${getRandomYears()} years of unbroken craftsmanship. Master weavers spend ${getRandomDays()} days creating each piece using ancient techniques passed down through generations.`,
      ],

      Pottery: [
        `Shaped from sacred clay in ${getRandomLocation(
          "pottery"
        )}, this ${product.name.toLowerCase()} carries a ${getRandomYears()}-year pottery tradition. Master potters from ${getRandomGenerations()} generations transform earth into art through ancient wheel and fire techniques.`,

        `Created in the pottery villages of ${getRandomLocation(
          "pottery"
        )}, this piece represents ${getRandomYears()} years of ceramic artistry. Each curve reflects the potter's spiritual connection with clay, fired in kilns burning continuously for centuries.`,
      ],

      Jewelry: [
        `Handcrafted in ${getRandomLocation(
          "jewelry"
        )}, this stunning ${product.name.toLowerCase()} showcases ${getRandomYears()} years of goldsmithing heritage. Master jewelers using ancient Kundan and Meenakari techniques create wearable art that carries cultural blessings.`,

        `From the jewelry ateliers of ${getRandomLocation(
          "jewelry"
        )}, this exquisite piece continues a ${getRandomYears()}-year tradition. Each gemstone is hand-set using techniques perfected over ${getRandomGenerations()} generations of craftsmen.`,
      ],

      Woodwork: [
        `Carved from fragrant wood near ${getRandomLocation(
          "woodwork"
        )}, this ${product.name.toLowerCase()} showcases ${getRandomYears()} years of woodcarving mastery. Traditional tools and ${getRandomDays()} days of patient work create each spiritual masterpiece.`,

        `From the woodworking centers of ${getRandomLocation(
          "woodwork"
        )}, this piece represents ${getRandomYears()} years of carving tradition. Master artisans breathe life into wood through devotion and skills passed down ${getRandomGenerations()} generations.`,
      ],

      Metalwork: [
        `Forged in ${getRandomLocation(
          "metalwork"
        )}, this ${product.name.toLowerCase()} continues a ${getRandomYears()}-year metalworking tradition. Ancient hammering and chasing techniques create intricate patterns that blend functionality with artistic beauty.`,

        `Created in traditional foundries of ${getRandomLocation(
          "metalwork"
        )}, this piece embodies ${getRandomYears()} years of brass-working heritage. Each engraving tells stories through techniques unchanged since ancient times.`,
      ],

      Paintings: [
        `Created in ${getRandomLocation(
          "paintings"
        )}, this ${product.name.toLowerCase()} preserves a ${getRandomYears()}-year painting tradition. Natural pigments from flowers and minerals bring ancient stories to life through ${getRandomGenerations()} generations of artistic wisdom.`,

        `From the art villages of ${getRandomLocation(
          "paintings"
        )}, this masterpiece continues ${getRandomYears()} years of cultural storytelling. Each brushstroke applied over ${getRandomDays()} days preserves India's rich artistic heritage.`,
      ],
    };

    // Get templates for the product category or use default
    const templates =
      storyTemplates[product.category as keyof typeof storyTemplates] ||
      storyTemplates.Paintings;
    const selectedTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return selectedTemplate;
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your artisan products with AI-powered features
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-transparent rounded-full"></div>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
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
              className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-gray-300">
              <option value="all">All Categories</option>
              {categories.map((category) => (
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
            <div
              key={product.id}
              onClick={() => handleViewProduct(product)}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-500 transition-all cursor-pointer">
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
                  <h3 className="font-semibold text-orange-400 truncate">
                    {product.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-lg font-bold text-orange-400">
                    {renderCurrencyIcon(product.currency)}
                    <span className="ml-1">
                      {product.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Story Indicator */}
                {product.story && (
                  <div className="flex items-center text-orange-400 text-sm mb-3">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>{getStoryStatusText(product.name)}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                      className="p-2 text-gray-400 hover:bg-gray-800 hover:text-orange-400 rounded"
                      title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                      className="p-2 text-gray-400 hover:bg-gray-800 hover:text-orange-400 rounded"
                      title="Edit Product">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                      title="Delete Product">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {!product.story && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateStory(product.id);
                      }}
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/20">
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
          <h3 className="text-lg font-medium text-orange-400 mb-2">
            No products found
          </h3>
          <p className="text-gray-400 mb-4">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by adding your first product."}
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-400">
                Add New Product
              </h2>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddProduct();
              }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="Textiles">Textiles</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Metalwork">Metalwork</option>
                    <option value="Paintings">Paintings</option>
                    <option value="Handicrafts">Handicrafts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Currency
                  </label>
                  <select
                    value={newProduct.currency}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image_url: e.target.value })
                  }
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a direct link to your product image (JPG, PNG, WebP)
                </p>
              </div>

              {/* Image Preview */}
              {newProduct.image_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Image Preview
                  </label>
                  <div className="w-32 h-32 border border-gray-600 rounded-lg overflow-hidden">
                    <img
                      src={newProduct.image_url}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "";
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your product, its features, and what makes it special..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={newProduct.tags}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, tags: e.target.value })
                  }
                  placeholder="handmade, traditional, silk, premium (comma-separated)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add tags separated by commas to help customers find your
                  product
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new_product_active"
                  checked={newProduct.is_active}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      is_active: e.target.checked,
                    })
                  }
                  className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <label
                  htmlFor="new_product_active"
                  className="text-sm text-gray-400">
                  Product is active and visible to customers
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAddModal}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !newProduct.name ||
                    !newProduct.description ||
                    !newProduct.price
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-black disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-400">
                {selectedProduct.name}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-600" />
                  </div>
                )}

                {/* Price and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-2xl font-bold text-orange-400">
                    {renderCurrencyIcon(selectedProduct.currency)}
                    <span className="ml-1">
                      {selectedProduct.price.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedProduct.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                    {selectedProduct.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    Category
                  </h3>
                  <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                    {selectedProduct.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.story && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Cultural Story
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedProduct.story}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    Created
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {new Date(selectedProduct.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => handleEditProduct(selectedProduct)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
              <Button
                onClick={closeModals}
                className="bg-orange-500 hover:bg-orange-600 text-black">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-400">
                Edit Product
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedProduct.name}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedProduct.price}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    defaultValue={selectedProduct.category}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="Textiles">Textiles</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Metalwork">Metalwork</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Currency
                  </label>
                  <select
                    defaultValue={selectedProduct.currency}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  defaultValue={selectedProduct.image_url}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue={selectedProduct.description}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {selectedProduct.story && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Cultural Story
                  </label>
                  <textarea
                    rows={4}
                    defaultValue={selectedProduct.story}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  defaultValue={selectedProduct.tags?.join(", ")}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  defaultChecked={selectedProduct.is_active}
                  className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-400">
                  Product is active
                </label>
              </div>
            </form>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={closeModals}
                className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Here you would handle the form submission
                  closeModals();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-black">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-400">Delete Product</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-500/20 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-center text-gray-300 mb-2">
                Are you sure you want to delete this product?
              </p>
              <p className="text-center font-medium text-white">
                "{selectedProduct.name}"
              </p>
              <p className="text-center text-sm text-gray-400 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={closeModals}
                className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
