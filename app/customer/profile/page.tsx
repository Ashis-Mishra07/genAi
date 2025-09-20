'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Eye, EyeOff, 
  Package, Heart, ShoppingCart, Clock, Star, Award, Camera
} from 'lucide-react';

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
    id: 'cust_001',
    name: 'Swasthik Mohanty',
    email: 'swas@email.com',
    phone: '+91 98765 43210',
    address: '123 Gandhi Street, Sector 15',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    joinDate: '2023-06-15'
  });

  const [editForm, setEditForm] = useState(profile);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Customer stats
  const customerStats = {
    totalOrders: 24,
    totalSpent: 85600,
    wishlistItems: 12,
    cartItems: 3,
    loyaltyPoints: 2140,
    membershipLevel: 'Silver'
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-20',
      items: 2,
      total: 12800,
      status: 'Delivered'
    },
    {
      id: 'ORD-002',
      date: '2024-01-15',
      items: 1,
      total: 8500,
      status: 'Shipped'
    },
    {
      id: 'ORD-003',
      date: '2024-01-10',
      items: 3,
      total: 5600,
      status: 'Processing'
    }
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
    console.log('Password change requested');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400">Manage your account information</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{customerStats.membershipLevel} Member</p>
                <p className="text-xs text-slate-400">{customerStats.loyaltyPoints} points</p>
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
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Picture */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-slate-700 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-orange-500 p-1 rounded-full hover:bg-orange-600 transition-colors">
                      <Camera className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{profile.name}</h3>
                  <p className="text-slate-400">Customer since {new Date(profile.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-white">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-white">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-white">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Join Date</label>
                  <div className="flex items-center space-x-2 text-white">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Address Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-white">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-white">{profile.city}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-white">{profile.state}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">PIN Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({...editForm, pincode: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-white">{profile.pincode}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Activity Sidebar */}
          <div className="space-y-6">
            {/* Customer Stats */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Account Overview</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Total Orders</span>
                  </div>
                  <span className="text-white font-semibold">{customerStats.totalOrders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Total Spent</span>
                  </div>
                  <span className="text-white font-semibold">₹{customerStats.totalSpent.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Wishlist Items</span>
                  </div>
                  <span className="text-white font-semibold">{customerStats.wishlistItems}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Loyalty Points</span>
                  </div>
                  <span className="text-orange-500 font-semibold">{customerStats.loyaltyPoints}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Membership Level</span>
                  <span className={`font-semibold ${
                    customerStats.membershipLevel === 'Gold' ? 'text-yellow-400' :
                    customerStats.membershipLevel === 'Silver' ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    {customerStats.membershipLevel}
                  </span>
                </div>
                <div className="mt-2 bg-slate-600 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    customerStats.membershipLevel === 'Gold' ? 'bg-yellow-400 w-full' :
                    customerStats.membershipLevel === 'Silver' ? 'bg-gray-300 w-2/3' : 'bg-orange-400 w-1/3'
                  }`}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">360 points to Gold level</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
              
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="bg-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{order.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{order.items} items</span>
                      <span>₹{order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/customer/orders')}
                className="w-full mt-4 text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
