"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Palette,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  path: string;
  gradient: string;
  onClick: () => void;
}

const RoleCard = ({
  title,
  description,
  icon,
  features,
  gradient,
  onClick,
}: RoleCardProps) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}>
    <div className="relative z-10">
      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/90 mb-6">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-white/80 text-sm">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full mr-3"></div>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center text-white group-hover:translate-x-2 transition-transform duration-300">
        <span className="font-medium">Get Started</span>
        <ArrowRight className="ml-2 h-5 w-5" />
      </div>
    </div>

    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
  </div>
);

export default function RoleSelectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleSelect = async (role: "admin" | "artisan" | "customer") => {
    setIsLoading(role);

    // Small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    switch (role) {
      case "admin":
        router.push("/auth/admin");
        break;
      case "artisan":
        router.push("/auth/artisan");
        break;
      case "customer":
        router.push("/auth/customer");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Sparkles className="h-12 w-12 text-yellow-400" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Artisan
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              {" "}
              Marketplace
            </span>
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Connect artisans with customers, showcase cultural heritage, and
            build a thriving marketplace for handmade treasures
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <RoleCard
            title="Admin"
            description="Manage the platform, oversee operations, and support the artisan community"
            icon={<Shield className="h-8 w-8 text-white" />}
            features={[
              "Platform management",
              "User oversight",
              "Analytics dashboard",
              "System configuration",
            ]}
            gradient="from-indigo-600 to-purple-600"
            path="/auth/admin"
            onClick={() => handleRoleSelect("admin")}
          />

          <RoleCard
            title="Artisan"
            description="Showcase your crafts, tell your story, and connect with customers worldwide"
            icon={<Palette className="h-8 w-8 text-white" />}
            features={[
              "Product showcase",
              "Story creation",
              "Customer chat",
              "Order management",
            ]}
            gradient="from-orange-500 to-red-500"
            path="/auth/artisan"
            onClick={() => handleRoleSelect("artisan")}
          />

          <RoleCard
            title="Customer"
            description="Discover unique handmade products and connect directly with talented artisans"
            icon={<ShoppingBag className="h-8 w-8 text-white" />}
            features={[
              "Browse products",
              "Chat with artisans",
              "Place orders",
              "Cultural stories",
            ]}
            gradient="from-emerald-500 to-teal-600"
            path="/auth/customer"
            onClick={() => handleRoleSelect("customer")}
          />
        </div>

        {/* Loading States */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-800 font-medium">
                Loading {isLoading} portal...
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-white/60">
          <p>Empowering artisans • Preserving culture • Building connections</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
