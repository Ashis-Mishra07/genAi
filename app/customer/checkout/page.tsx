"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  Shield,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { GoogleLoaderInline } from "@/components/ui/google-loader";

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">(
    "standard"
  );

  useEffect(() => {
    loadCheckoutData();
  }, []);

  useEffect(() => {
    // Check if Razorpay script is loaded
    const checkRazorpay = () => {
      if (window.Razorpay) {
        console.log("✅ Razorpay is available:", window.Razorpay);
      } else {
        console.log("❌ Razorpay is not available yet");
        // Try again after a short delay
        setTimeout(checkRazorpay, 1000);
      }
    };

    checkRazorpay();

    // Debug environment variables
    console.log("=== Environment Variables Debug ===");
    console.log(
      "NEXT_PUBLIC_RAZORPAY_KEY_ID:",
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    );
    console.log(
      "All env vars starting with NEXT_PUBLIC:",
      Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC"))
    );
  }, []);

  const checkAuth = () => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
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
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

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
        const totalsData = data.totals || {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
        };
        setTotals({
          ...totalsData,
          itemCount:
            data.cartItems?.reduce(
              (sum: number, item: any) => sum + item.quantity,
              0
            ) || 0,
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    return requiredFields.every(
      (field) => shippingAddress[field].trim() !== ""
    );
  };

  const getFinalTotal = () => {
    const deliveryCharge = deliveryMethod === "express" ? 199 : totals.shipping;
    return totals.subtotal + deliveryCharge + totals.tax;
  };

  const placeOrder = async () => {
    console.log("=== PLACE ORDER STARTED ===");
    console.log("Payment method selected:", paymentMethod);

    if (!isAddressValid()) {
      alert("Please fill in all shipping address fields.");
      return;
    }

    if (cartItems.length === 0) {
      alert("No items to checkout.");
      return;
    }

    console.log("Address valid, cart has items, proceeding...");
    setIsProcessing(true);

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        console.log("No auth token found, redirecting to login");
        router.push("/auth/customer");
        return;
      }

      console.log("Auth token found, payment method:", paymentMethod);

      // If COD, directly create order
      if (paymentMethod === "cod") {
        console.log("Processing COD order...");
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
          paymentMethod,
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          router.push(
            `/customer/orders?success=true&orderId=${
              data.order?.orderNumber || ""
            }`
          );
        } else {
          alert(data.error || "Failed to place order. Please try again.");
        }
      } else {
        // Online payment with Razorpay
        console.log("=== STARTING RAZORPAY PAYMENT ===");
        console.log("Initiating Razorpay payment...");

        const amount = getFinalTotal() * 100; // Convert to paise
        console.log("Order amount in paise:", amount);

        // Create Razorpay order
        console.log("Creating Razorpay order...");
        const orderResponse = await fetch("/api/online-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount,
            notes: {
              customer: shippingAddress.fullName,
              email: shippingAddress.email,
              phone: shippingAddress.phone,
            },
          }),
        });

        console.log("Order response status:", orderResponse.status);
        const orderData = await orderResponse.json();
        console.log("Razorpay order created:", orderData);

        if (!orderResponse.ok) {
          console.error("Failed to create Razorpay order:", orderData);
          alert("Failed to create payment order. Please try again.");
          setIsProcessing(false);
          return;
        }

        // Check if Razorpay is loaded
        console.log("Checking if Razorpay is available...");
        console.log("window.Razorpay:", window.Razorpay);

        if (!window.Razorpay) {
          console.error("Razorpay is not loaded!");
          alert(
            "Payment gateway is not loaded. Please refresh the page and try again."
          );
          setIsProcessing(false);
          return;
        }

        // Get Razorpay key
        const razorpayKey =
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RYqgZ3SxIOPQQt";
        console.log("Using Razorpay key:", razorpayKey);

        if (!razorpayKey) {
          console.error("No Razorpay key available!");
          alert("Payment configuration error. Please contact support.");
          setIsProcessing(false);
          return;
        }

        console.log("Opening Razorpay checkout with options:");

        // Initialize Razorpay
        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: "AI Artisan Marketplace",
          description: `Order for ${cartItems.length} items`,
          image: "/logo.png",
          prefill: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            contact: shippingAddress.phone,
          },
          theme: {
            color: "#3B82F6",
          },
          handler: async function (response: any) {
            console.log("Payment successful! Response:", response);
            try {
              // Verify payment
              const verifyResponse = await fetch("/api/verify-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.verified) {
                // Create order in database
                const finalOrderData = {
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
                  deliveryMethod,
                  status: "CONFIRMED",
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                };

                const createOrderResponse = await fetch("/api/orders", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify(finalOrderData),
                });

                const createOrderData = await createOrderResponse.json();

                if (createOrderResponse.ok && createOrderData.success) {
                  // Clear cart
                  await fetch("/api/cart", {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                  });

                  router.push(
                    `/customer/orders?success=true&orderId=${
                      createOrderData.order?.orderNumber || ""
                    }&payment=success`
                  );
                } else {
                  alert(
                    "Payment successful but failed to create order. Please contact support."
                  );
                }
              } else {
                alert("Payment verification failed. Please contact support.");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              alert("Payment processing error. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () {
              console.log("Payment modal dismissed");
              setIsProcessing(false);
            },
          },
        };

        console.log("Razorpay options:", options);
        console.log("Creating Razorpay instance...");

        try {
          // @ts-ignore
          const rzp = new window.Razorpay(options);
          console.log("Razorpay instance created:", rzp);
          console.log("Opening Razorpay modal...");
          rzp.open();
          console.log("Razorpay modal opened!");
        } catch (razorpayError) {
          console.error("Error creating/opening Razorpay:", razorpayError);
          alert("Failed to open payment gateway. Please try again.");
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("An error occurred while placing your order. Please try again.");
      setIsProcessing(false);
    }

    // Only set processing to false for COD, Razorpay handles it in modal dismiss
    if (paymentMethod === "cod") {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <GoogleLoaderInline
              size="lg"
              text="Preparing Your Checkout"
              textClassName="text-foreground font-bold text-2xl"
            />
            <p className="text-muted-foreground text-lg">
              Loading your cart and preferences...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center py-20">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-4 border-border">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Checkout Error
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={() => router.push("/customer/cart")}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
            🛒 Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/customer/cart")}
              className="mr-6 p-3 rounded-xl hover:bg-muted transition-all transform hover:scale-105 backdrop-blur-sm border border-border">
              <ArrowLeft className="h-6 w-6 text-card-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground mb-2">
                Secure Checkout
              </h1>
              <p className="text-muted-foreground text-lg">
                Complete your order safely and securely
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-xl">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/20 rounded-xl mr-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      handleAddressChange("fullName", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) =>
                      handleAddressChange("email", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Address *
                  </label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) =>
                      handleAddressChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="House No., Building, Street, Area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) =>
                      handleAddressChange("pincode", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all"
                    placeholder="000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    disabled
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-xl">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/20 rounded-xl mr-3">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Delivery Method
                </h2>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setDeliveryMethod("standard")}
                  className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                    deliveryMethod === "standard"
                      ? "border-primary bg-primary/20 shadow-lg"
                      : "border-border hover:border-muted-foreground hover:bg-muted/30"
                  }`}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "standard"}
                    onChange={() => setDeliveryMethod("standard")}
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="text-card-foreground font-medium">
                        Standard Delivery
                      </label>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      5-7 business days
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryMethod("express")}
                  className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                    deliveryMethod === "express"
                      ? "border-primary bg-primary/20 shadow-lg"
                      : "border-border hover:border-muted-foreground hover:bg-muted/30"
                  }`}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "express"}
                    onChange={() => setDeliveryMethod("express")}
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="text-card-foreground font-medium">
                        Express Delivery
                      </label>
                      <span className="text-primary font-semibold">₹199</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      2-3 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-xl">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/20 rounded-xl mr-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/20 shadow-lg"
                      : "border-border hover:border-muted-foreground hover:bg-muted/30"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-card-foreground font-medium">
                      Cash on Delivery
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay when you receive
                    </p>
                  </div>
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                </div>

                <div
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                    paymentMethod === "online"
                      ? "border-primary bg-primary/20 shadow-lg"
                      : "border-border hover:border-muted-foreground hover:bg-muted/30"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-card-foreground font-medium">
                      Online Payment
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      UPI, Cards, Netbanking, Wallets
                    </p>
                  </div>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border shadow-xl sticky top-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/20 rounded-xl mr-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Order Summary
                </h2>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-muted/50 rounded-xl flex-shrink-0 overflow-hidden border border-border">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-card-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        by {item.artisanName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-card-foreground">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span
                    className={
                      deliveryMethod === "standard" && totals.shipping === 0
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }>
                    {deliveryMethod === "standard"
                      ? totals.shipping === 0
                        ? "FREE"
                        : `₹${totals.shipping}`
                      : "₹199"}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (GST 18%)</span>
                  <span>₹{totals.tax.toLocaleString()}</span>
                </div>

                {deliveryMethod === "standard" && totals.shipping === 0 && (
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Free shipping applied!
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-card-foreground font-bold text-lg">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={
                  isProcessing || !isAddressValid() || cartItems.length === 0
                }
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg">
                {isProcessing ? (
                  <GoogleLoaderInline
                    size="sm"
                    text="Processing Order..."
                    textClassName="text-primary-foreground font-bold"
                  />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>🛒 Place Order Securely</span>
                  </>
                )}
              </button>

              {!isAddressValid() && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <p className="text-sm text-destructive text-center font-medium">
                    ⚠️ Please fill all required address fields
                  </p>
                </div>
              )}

              {/* Security Info */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center text-sm text-muted-foreground font-medium">
                    <div className="p-2 bg-green-500/20 rounded-lg mr-2">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>🔒 Secure & Protected Checkout</span>
                  </div>
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-2" />
                    <span>
                      ✅ 30-day easy returns • 🚚 Safe delivery guaranteed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
