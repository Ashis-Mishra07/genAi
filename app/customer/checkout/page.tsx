"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  IndianRupee,
  MapPin, Package, Shield,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  inStock: boolean;
  artisanName: string;
  artisanLocation: string;
  addedAt: string;
}

interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");

  // Load Razorpay Checkout.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/customer");
      return false;
    }
    return true;
  };

  const loadCheckoutData = async () => {
    if (!checkAuth()) return;

    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/customer");
        return;
      }

      const response = await fetch("/api/cart/details", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (!data.cartItems || data.cartItems.length === 0) {
          router.push("/customer/products");
          return;
        }

        setCartItems(data.cartItems || []);
        const totalsData = data.totals || { subtotal: 0, shipping: 0, tax: 0, total: 0 };
        setTotals({
          ...totalsData,
          itemCount:
            data.cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
        });

        fetchUserProfile(token);
      } else if (response.status === 401) {
        router.push("/auth/customer");
      } else {
        setError("Failed to load cart items");
        setTimeout(() => router.push("/customer/cart"), 2000);
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
      setError("Failed to load checkout data");
      setTimeout(() => router.push("/customer/cart"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setShippingAddress((prev) => ({
            ...prev,
            fullName: data.user.name || prev.fullName,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isAddressValid = () => {
    const requiredFields: (keyof ShippingAddress)[] = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];
    return requiredFields.every((field) => shippingAddress[field].trim() !== "");
  };

  const getFinalTotal = () => {
    const deliveryCharge = deliveryMethod === "express" ? 199 : totals.shipping;
    return totals.subtotal + deliveryCharge + totals.tax;
  };

  async function createAppOrderAfterPayment(paymentDetails?: any) {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Not authenticated");

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        artisanName: item.artisanName,
      })),
      total: getFinalTotal(),
      currency: cartItems[0]?.currency || "INR",
      shippingAddress,
      paymentMethod: "online",
      paymentStatus: "paid",  // Changed from "completed" to match database constraint
      paymentDetails: paymentDetails || {},
      deliveryMethod,
      status: "confirmed",  // Lowercase to match database values
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Create order failed: ${msg}`);
    }
    const data = await res.json();

    // Clear cart
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    // Show success screen instead of immediate redirect
    setOrderNumber(data.order?.orderNumber || "");
    setShowSuccessScreen(true);
    setIsProcessing(false);

    // Auto-redirect after 3 seconds
    setTimeout(() => {
      router.push(`/customer/orders?success=true&orderId=${data.order?.orderNumber || ""}`);
    }, 3000);
  }

  const placeOrder = async () => {
    if (!isAddressValid()) {
      alert("Please fill in all shipping address fields.");
      return;
    }
    if (cartItems.length === 0) {
      alert("No items to checkout.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/customer");
        return;
      }

      if (paymentMethod === "online") {
        // 1) Create Razorpay Order on server
        const amountPaise = Math.round(getFinalTotal() * 100);
        const res = await fetch("/api/online-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amount: amountPaise }),
        });

        // Avoid crashing on HTML responses (e.g., error pages)
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Order API ${res.status}: ${txt.slice(0, 200)}`);
        }
        const { orderId } = await res.json();

        // 2) Open Razorpay Checkout
        if (!window.Razorpay) {
          alert("Payment SDK not loaded. Please try again.");
          return;
        }

        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: orderId,
          name: "Artisan Portal",
          description: "Order Payment",
          prefill: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            contact: shippingAddress.phone,
          },
          theme: { color: "#3399cc" },
          handler: async (response: any) => {
            try {
              // 3) Verify signature on server
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              if (!verifyRes.ok) {
                const t = await verifyRes.text();
                throw new Error(`Verification failed: ${t}`);
              }
              const verifyJson = await verifyRes.json();
              if (!verifyJson.verified) {
                throw new Error("Signature not verified");
              }

              // 4) Create app order as CONFIRMED with payment details
              const paymentDetails = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment_method: 'online',
                payment_status: 'completed',
                amount: getFinalTotal(),
                currency: 'INR',
                timestamp: new Date().toISOString()
              };
              
              await createAppOrderAfterPayment(paymentDetails);
            } catch (e: any) {
              console.error("Payment verification error:", e);
              alert("Payment verification failed. Please contact support.");
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => setIsProcessing(false),
          },
        });

        rzp.open();
        return; // prevent falling through to COD flow
      }

      // COD flow
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          artisanName: item.artisanName,
        })),
        total: getFinalTotal(),
        currency: cartItems[0]?.currency || "INR",
        shippingAddress,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        paymentDetails: {
          payment_method: 'cod',
          payment_status: 'pending',
          amount: getFinalTotal(),
          currency: 'INR'
        },
        deliveryMethod,
        status: "PENDING",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        // Show success screen instead of immediate redirect
        setOrderNumber(data.order?.orderNumber || "");
        setShowSuccessScreen(true);
        setIsProcessing(false);

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push(`/customer/orders?success=true&orderId=${data.order?.orderNumber || ""}`);
        }, 3000);
      } else {
        alert(data.error || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("An error occurred while placing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-spin mx-auto text-orange-500 mb-4" />
          <p className="text-slate-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Success Screen - Show after payment verification and order creation
  if (showSuccessScreen) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h2>
          
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <p className="text-slate-400 mb-2">Order Number</p>
            <p className="text-2xl font-bold text-orange-400 mb-4">
              {orderNumber || "Processing..."}
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Order Confirmed</span>
            </div>
          </div>

          <p className="text-slate-400 mb-6">
            Your order has been successfully placed. You will receive a confirmation email shortly.
          </p>

          <div className="flex items-center justify-center space-x-2 text-slate-400 mb-6">
            <Clock className="h-5 w-5 animate-spin" />
            <span className="text-sm">Redirecting to your orders in 3 seconds...</span>
          </div>

          <button
            onClick={() => router.push(`/customer/orders?success=true&orderId=${orderNumber}`)}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors w-full"
          >
            View Order Details
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/customer/cart")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/customer/cart")}
            className="mr-4 p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="text-slate-400">Complete your order</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleAddressChange("fullName", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange("email", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="House No., Building, Street, Area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    disabled
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center mb-6">
                <Truck className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold text-white">Delivery Method</h2>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setDeliveryMethod("standard")}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryMethod === "standard"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-600 hover:border-slate-500"
                    }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "standard"}
                    onChange={() => setDeliveryMethod("standard")}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium">Standard Delivery</label>
                      <span className="text-green-400 font-semibold">
                        {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">5-7 business days</p>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryMethod("express")}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryMethod === "express"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-600 hover:border-slate-500"
                    }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "express"}
                    onChange={() => setDeliveryMethod("express")}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium">Express Delivery</label>
                      <span className="text-orange-400 font-semibold">₹199</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">2-3 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center mb-6">
                <CreditCard className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold text-white">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-600 hover:border-slate-500"
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-500"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-white font-medium">Cash on Delivery</label>
                    <p className="text-sm text-slate-400 mt-1">Pay when you receive</p>
                  </div>
                  <IndianRupee className="h-5 w-5 text-slate-400" />
                </div>

                <div
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "online"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-600 hover:border-slate-500"
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-500"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-white font-medium">Online Payment (Razorpay)</label>
                    <p className="text-sm text-slate-400 mt-1">UPI, Cards, Netbanking</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-slate-700 rounded flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                      <p className="text-xs text-slate-400">by {item.artisanName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-white">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-700 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charges</span>
                  <span
                    className={
                      deliveryMethod === "standard" && totals.shipping === 0 ? "text-green-400" : ""
                    }
                  >
                    {deliveryMethod === "standard"
                      ? totals.shipping === 0
                        ? "FREE"
                        : `₹${totals.shipping}`
                      : "₹199"}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Tax (GST 18%)</span>
                  <span>₹{totals.tax.toLocaleString()}</span>
                </div>

                {deliveryMethod === "standard" && totals.shipping === 0 && (
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Free shipping applied!
                  </div>
                )}

                <div className="border-t border-slate-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={isProcessing || !isAddressValid() || cartItems.length === 0}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              {!isAddressValid() && (
                <p className="text-sm text-red-400 mt-3 text-center">
                  Please fill all address fields
                </p>
              )}

              {/* Security Info */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-center text-sm text-slate-400">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Secure & Protected Checkout</span>
                </div>
                <div className="flex items-center justify-center text-xs text-slate-500 mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>30-day easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
