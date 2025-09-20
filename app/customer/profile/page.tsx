"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Heart,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  Settings,
} from "lucide-react";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateJoined: string;
  addresses: Address[];
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
}

interface Address {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CustomerProfile | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    loadProfile();
    loadOrderStats();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // Try to fetch real profile data from API
      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Transform user data to CustomerProfile format
          const userProfile: CustomerProfile = {
            id: data.user.id,
            name: data.user.name || "Customer",
            email: data.user.email,
            phone: data.user.phone || "",
            avatar: "",
            dateJoined: data.user.createdAt || new Date().toISOString(),
            addresses: [], // Empty for now, can be populated from a separate API
            preferences: {
              emailNotifications: true,
              smsNotifications: true,
              marketingEmails: false,
            },
          };

          setProfile(userProfile);
          setEditedProfile(userProfile);
          return;
        }
      }

      // Fallback to basic profile structure if API fails
      const fallbackProfile: CustomerProfile = {
        id: "customer-1",
        name: "Customer",
        email: "customer@email.com",
        phone: "",
        avatar: "",
        dateJoined: new Date().toISOString(),
        addresses: [],
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false,
        },
      };

      setProfile(fallbackProfile);
      setEditedProfile(fallbackProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadOrderStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // Try to fetch real order stats from API
      const response = await fetch("/api/orders", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.orders) {
          const orders = data.orders;
          const stats: OrderStats = {
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
            pendingOrders: orders.filter((o: any) => o.status === "pending").length,
            deliveredOrders: orders.filter((o: any) => o.status === "delivered").length,
          };
          
          setOrderStats(stats);
          return;
        }
      }

      // Fallback stats if API fails
      const fallbackStats: OrderStats = {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
      };

      setOrderStats(fallbackStats);
    } catch (error) {
      console.error("Error loading order stats:", error);
      // Fallback stats if error occurs
      const fallbackStats: OrderStats = {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
      };
      setOrderStats(fallbackStats);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!editedProfile) return;

    try {
      // Implement API call to save profile
      setProfile(editedProfile);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updatePreference = (key: keyof CustomerProfile["preferences"], value: boolean) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      preferences: {
        ...editedProfile.preferences,
        [key]: value,
      },
    });
  };

  const logout = () => {
    // Implement logout logic
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      router.push("/auth/customer/signin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error loading profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push("/customer/dashboard")}
              className="flex items-center text-gray-600 hover:text-emerald-600 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <div className="flex items-center">
              <User className="h-6 w-6 text-emerald-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-emerald-600 hover:text-emerald-700"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveProfile}
                      className="flex items-center bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-gray-600">Customer since {new Date(profile.dateJoined).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.name || ""}
                      onChange={(e) =>
                        setEditedProfile(prev => prev ? { ...prev, name: e.target.value } : null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile?.email || ""}
                      onChange={(e) =>
                        setEditedProfile(prev => prev ? { ...prev, email: e.target.value } : null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile?.phone || ""}
                      onChange={(e) =>
                        setEditedProfile(prev => prev ? { ...prev, phone: e.target.value } : null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Add Address
                </button>
              </div>

              <div className="space-y-4">
                {profile.addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded">
                          {address.type.toUpperCase()}
                        </span>
                        {address.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingAddress(address)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-medium text-gray-900">{address.name}</p>
                    <p className="text-gray-600">{address.address}</p>
                    <p className="text-gray-600">{address.city}, {address.state} {address.pincode}</p>
                    <p className="text-gray-600">{address.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get order updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile?.preferences.emailNotifications || false}
                      onChange={(e) => updatePreference("emailNotifications", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Get order updates via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile?.preferences.smsNotifications || false}
                      onChange={(e) => updatePreference("smsNotifications", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Marketing Emails</p>
                    <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile?.preferences.marketingEmails || false}
                      onChange={(e) => updatePreference("marketingEmails", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Order Stats */}
            {orderStats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-semibold text-gray-900">{orderStats.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-emerald-600">₹{orderStats.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Orders</span>
                    <span className="font-semibold text-yellow-600">{orderStats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivered Orders</span>
                    <span className="font-semibold text-green-600">{orderStats.deliveredOrders}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/customer/orders")}
                  className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">My Orders</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={() => router.push("/customer/wishlist")}
                  className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Wishlist</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Help & Support</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-red-50 text-red-600"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
