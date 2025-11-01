"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Package,
  Heart,
  ShoppingCart,
  Clock,
  Star,
  Award,
  Camera,
} from "lucide-react";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  joinDate: string;
  avatar?: string;
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState<CustomerProfile>({
    id: "cust_001",
    name: "Swasthik Mohanty",
    email: "swas@email.com",
    phone: "+91 98765 43210",
    address: "123 Gandhi Street, Sector 15",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    joinDate: "2023-06-15",
  });

  const [editForm, setEditForm] = useState(profile);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Customer stats
  const customerStats = {
    totalOrders: 24,
    totalSpent: 85600,
    wishlistItems: 12,
    cartItems: 3,
    loyaltyPoints: 2140,
    membershipLevel: "Silver",
  };

  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-20",
      items: 2,
      total: 12800,
      status: "Delivered",
    },
    {
      id: "ORD-002",
      date: "2024-01-15",
      items: 1,
      total: 8500,
      status: "Shipped",
    },
    {
      id: "ORD-003",
      date: "2024-01-10",
      items: 3,
      total: 5600,
      status: "Processing",
    },
  ];

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    // In a real app, this would call an API to change password
    console.log("Password change requested");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6 -mx-4 -mt-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-secondary rounded-xl px-4 py-3">
              <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {customerStats.membershipLevel} Member
                </p>
                <p className="text-xs text-muted-foreground">
                  {customerStats.loyaltyPoints} points
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors">
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Picture */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full hover:bg-orange-600 transition-colors shadow-lg">
                      <Camera className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {profile.name}
                  </h3>
                  <p className="text-muted-foreground">
                    Customer since{" "}
                    {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 text-foreground bg-secondary rounded-lg px-4 py-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 text-foreground bg-secondary rounded-lg px-4 py-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 text-foreground bg-secondary rounded-lg px-4 py-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Join Date
                  </label>
                  <div className="flex items-center space-x-3 text-foreground bg-secondary rounded-lg px-4 py-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(profile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Address Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Street Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 text-foreground bg-secondary rounded-lg px-4 py-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="bg-secondary rounded-lg px-4 py-3">
                      <span className="text-foreground">{profile.city}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) =>
                        setEditForm({ ...editForm, state: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="bg-secondary rounded-lg px-4 py-3">
                      <span className="text-foreground">{profile.state}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    PIN Code
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pincode: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="bg-secondary rounded-lg px-4 py-3">
                      <span className="text-foreground">{profile.pincode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Change Password
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Activity Sidebar */}
          <div className="space-y-6">
            {/* Customer Stats */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Account Overview
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground font-medium">
                      Total Orders
                    </span>
                  </div>
                  <span className="text-foreground font-semibold">
                    {customerStats.totalOrders}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground font-medium">
                      Total Spent
                    </span>
                  </div>
                  <span className="text-foreground font-semibold">
                    ₹{customerStats.totalSpent.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground font-medium">
                      Wishlist Items
                    </span>
                  </div>
                  <span className="text-foreground font-semibold">
                    {customerStats.wishlistItems}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground font-medium">
                      Loyalty Points
                    </span>
                  </div>
                  <span className="text-orange-500 font-semibold">
                    {customerStats.loyaltyPoints}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-secondary rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Membership Level
                  </span>
                  <span
                    className={`font-semibold ${
                      customerStats.membershipLevel === "Gold"
                        ? "text-yellow-500"
                        : customerStats.membershipLevel === "Silver"
                        ? "text-gray-400"
                        : "text-orange-500"
                    }`}>
                    {customerStats.membershipLevel}
                  </span>
                </div>
                <div className="mt-3 bg-background rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      customerStats.membershipLevel === "Gold"
                        ? "bg-yellow-500 w-full"
                        : customerStats.membershipLevel === "Silver"
                        ? "bg-gray-400 w-2/3"
                        : "bg-orange-500 w-1/3"
                    }`}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  360 points to Gold level
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Recent Orders
              </h2>

              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-secondary rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground font-medium">
                        {order.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-600"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{order.items} items</span>
                      <span className="font-medium">
                        ₹{order.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/customer/orders")}
                className="w-full mt-6 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors bg-orange-50 py-3 rounded-lg hover:bg-orange-100">
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
