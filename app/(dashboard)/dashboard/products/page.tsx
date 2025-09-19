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
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.description && newProduct.price) {
      const product: Product = {
        id: Math.max(...products.map((p) => p.id), 0) + 1,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        currency: newProduct.currency,
        image_url: newProduct.image_url || undefined,
        category: newProduct.category,
        tags: newProduct.tags
          ? newProduct.tags.split(",").map((tag) => tag.trim())
          : [],
        is_active: newProduct.is_active,
        created_at: new Date().toISOString(),
      };

      setProducts([product, ...products]);
      resetAddForm();
      setShowAddModal(false);
      // Here you would also make API call to save to database
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
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setProducts([
          {
            id: 1,
            name: "Handwoven Banarasi Silk Saree",
            description:
              "Exquisite handwoven silk saree with intricate gold zari work, representing centuries of Banarasi weaving tradition.",
            story:
              "This magnificent saree carries the legacy of Banaras weavers who have perfected their craft over 500 years. Each thread tells a story of dedication, passed down through generations of skilled artisans in the holy city of Varanasi.",
            price: 15000.0,
            currency: "$",
            image_url:
              "https://images.unsplash.com/photo-1737816473298-b76011905c28?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEhhbmR3b3ZlbiUyMEJhbmFyYXNpJTIwU2lsayUyMFNhcmVlfGVufDB8fDB8fHww",
            category: "Textiles",
            tags: [
              "silk",
              "saree",
              "banarasi",
              "handwoven",
              "traditional",
              "gold-zari",
            ],
            is_active: true,
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: 2,
            name: "Blue Pottery Dinner Set",
            description:
              "Beautiful hand-painted blue pottery dinner set from Jaipur, featuring traditional Rajasthani motifs and Persian-inspired designs.",
            story:
              "Born in the pink city of Jaipur, this blue pottery reflects the Persian influence on Indian craftsmanship. Each piece is meticulously hand-painted by skilled artisans who learned this art form from their ancestors.",
            price: 3500.0,
            currency: "INR",
            image_url:
              "https://images.unsplash.com/photo-1724709162118-60c05c4c3fcf?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEJsdWUlMjBQb3R0ZXJ5JTIwRGlubmVyJTIwU2V0fGVufDB8fDB8fHww",
            category: "Pottery",
            tags: [
              "pottery",
              "ceramic",
              "blue",
              "jaipur",
              "dinnerware",
              "hand-painted",
            ],
            is_active: true,
            created_at: "2024-01-20T14:15:00Z",
          },
          {
            id: 3,
            name: "Kundan Meenakari Necklace",
            description:
              "Elegant Kundan jewelry with vibrant Meenakari work, showcasing the royal jewelry traditions of Rajasthan.",
            story:
              "This stunning necklace represents the grandeur of Rajasthani royal courts. The Kundan setting technique dates back to the Mughal era, while the colorful Meenakari enamel work adds life to each precious stone.",
            price: 8500.0,
            currency: "INR",
            image_url:
              "https://images.unsplash.com/photo-1554140535-847ce2a7f896?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fEt1bmRhbiUyME1lZW5ha2FyaSUyME5lY2tsYWNlfGVufDB8fDB8fHww",
            category: "Jewelry",
            tags: [
              "kundan",
              "meenakari",
              "necklace",
              "rajasthani",
              "gold",
              "traditional",
            ],
            is_active: true,
            created_at: "2024-01-25T16:45:00Z",
          },
          {
            id: 4,
            name: "Sandalwood Carved Lord Ganesha",
            description:
              "Intricate sandalwood carving of Lord Ganesha, showcasing the fine woodworking traditions of Karnataka.",
            story:
              "Carved from fragrant sandalwood in the workshops of Mysore, this sculpture embodies centuries of South Indian woodcarving tradition. Each detail reflects the devotion and skill of master craftsmen.",
            price: 2800.0,
            currency: "INR",
            image_url:
              "https://images.unsplash.com/photo-1701172188718-35894ba655ee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U2FuZGFsd29vZCUyMENhcnZlZCUyMExvcmQlMjBHYW5lc2hhfGVufDB8fDB8fHww",
            category: "Woodwork",
            tags: [
              "sandalwood",
              "carved",
              "ganesha",
              "mysore",
              "spiritual",
              "handcrafted",
            ],
            is_active: false,
            created_at: "2024-01-30T11:20:00Z",
          },
          {
            id: 5,
            name: "Brass Tanjore Plate Set",
            description:
              "Traditional brass plate set with intricate engravings, perfect for festivals and special occasions.",
            story:
              "Crafted in the temple town of Tanjore, these brass plates have adorned South Indian households for generations. The intricate engravings tell stories of gods and goddesses, making every meal a blessed experience.",
            price: 1200.0,
            currency: "INR",
            image_url:
              "https://images.unsplash.com/photo-1652960018678-1f19799996c5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEJyYXNzJTIwVGFuam9yZSUyMFBsYXRlJTIwU2V0fGVufDB8fDB8fHww",
            category: "Metalwork",
            tags: [
              "brass",
              "tanjore",
              "engraved",
              "traditional",
              "festival",
              "dining",
            ],
            is_active: true,
            created_at: "2024-02-05T09:15:00Z",
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading products:", error);
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
      const locations = {
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
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Products</h1>
          <p className="text-gray-400">
            Manage your artisan products with AI-powered features
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-black">
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
