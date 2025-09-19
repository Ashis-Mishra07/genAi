"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Package,
  DollarSign,
  Camera,
  Save,
  X,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
}

export default function ArtisanProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  const categories = [
    "Pottery",
    "Jewelry",
    "Woodworking",
    "Textiles",
    "Metalwork",
    "Glass Art",
    "Leather Goods",
    "Sculpture",
    "Paintings",
    "Other",
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      setError("Failed to load products");
      console.error("Products load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      await loadProducts(); // Reload products
      setShowAddModal(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
      });
      setError("");
    } catch (error) {
      setError("Failed to add product");
      console.error("Add product error:", error);
    }
  };

  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product status");
      }

      await loadProducts(); // Reload products
    } catch (error) {
      setError("Failed to update product status");
      console.error("Update product error:", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      await loadProducts(); // Reload products
    } catch (error) {
      setError("Failed to delete product");
      console.error("Delete product error:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && product.isActive) ||
      (filterStatus === "inactive" && !product.isActive);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Package className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="flex items-center text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center text-white">
            <Package className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">My Products</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-3.5 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-white/70" />
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500">
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-r from-orange-500 to-pink-500 relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    product.isActive
                      ? "bg-green-500/80 text-white"
                      : "bg-gray-500/80 text-white"
                  }`}>
                  {product.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2">
                  {product.name}
                </h3>
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-orange-400 font-bold text-xl">
                    ${product.price}
                  </span>
                  <span className="text-white/50 text-sm">
                    {product.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      toggleProductStatus(product.id, product.isActive)
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.isActive
                        ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }`}>
                    <Eye className="h-4 w-4 inline mr-1" />
                    {product.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => {
                      /* Edit functionality */
                    }}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-white/70 py-12">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No products found</p>
            <p className="text-sm">Start by adding your first product!</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-white/20 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200">
                  <Save className="h-4 w-4 inline mr-2" />
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
