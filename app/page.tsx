"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Palette,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Star,
  Users,
  Heart,
  Globe,
} from "lucide-react";
import { GoogleLoaderWithText } from "@/components/ui/google-loader";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  path: string;
  color: string;
  onClick: () => void;
}

const RoleCard = ({
  title,
  description,
  icon,
  features,
  color,
  onClick,
}: RoleCardProps) => (
  <div
    onClick={onClick}
    className="group bg-card border border-border rounded-2xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50">
    <div className="flex flex-col h-full">
      <div
        className={`h-16 w-16 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-primary font-semibold">Get Started</span>
        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </div>
  </div>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center p-6">
    <div className="text-3xl font-bold text-primary mb-2">{number}</div>
    <div className="text-muted-foreground text-sm">{label}</div>
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5"></div>

        <div className="relative container mx-auto px-4 py-20">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              AI{" "}
              <span>
                <span className="text-blue-600 dark:text-blue-400">A</span>
                <span className="text-red-500 dark:text-red-400">r</span>
                <span className="text-yellow-500 dark:text-yellow-400">t</span>
                <span className="text-blue-600 dark:text-blue-400">i</span>
                <span className="text-green-500 dark:text-green-400">s</span>
                <span className="text-red-500 dark:text-red-400">a</span>
                <span className="text-blue-600 dark:text-blue-400">n</span>
              </span>
              <span className="bg-gradient-to-r  bg-clip-text">
                {" "}
                Marketplace
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Connect talented artisans with passionate customers, showcase
              cultural heritage through AI-powered storytelling, and build a
              thriving marketplace for authentic handmade treasures
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <StatCard number="1000+" label="Active Artisans" />
              <StatCard number="50K+" label="Happy Customers" />
              <StatCard number="25K+" label="Products Sold" />
              <StatCard number="4.9★" label="Average Rating" />
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <RoleCard
              title="Admin"
              description="Manage the platform, oversee operations, and support the artisan community with advanced analytics and AI tools"
              icon={
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              }
              features={[
                "Platform management & analytics",
                "User oversight & support",
                "AI video generation tools",
                "Advanced reporting dashboard",
                "System configuration",
              ]}
              color="bg-blue-500/10"
              path="/auth/admin"
              onClick={() => handleRoleSelect("admin")}
            />

            <RoleCard
              title="Artisan"
              description="Showcase your crafts, tell your story with AI assistance, and connect with customers worldwide"
              icon={
                <Palette className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              }
              features={[
                "Product showcase & management",
                "AI-powered story creation",
                "Customer chat & communication",
                "Order management system",
                "Cultural video generation",
              ]}
              color="bg-orange-500/10"
              path="/auth/artisan"
              onClick={() => handleRoleSelect("artisan")}
            />

            <RoleCard
              title="Customer"
              description="Discover unique handmade products, learn cultural stories, and connect directly with talented artisans"
              icon={
                <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
              }
              features={[
                "Browse authentic products",
                "Interactive artisan chat",
                "Secure order placement",
                "Cultural story experiences",
                "Personalized recommendations",
              ]}
              color="bg-green-500/10"
              path="/auth/customer"
              onClick={() => handleRoleSelect("customer")}
            />
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the perfect blend of traditional craftsmanship and
                modern AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <FeatureCard
                icon={<Sparkles className="h-6 w-6 text-primary" />}
                title="AI-Powered Stories"
                description="Generate authentic cultural narratives for products using advanced AI technology"
              />
              <FeatureCard
                icon={<Heart className="h-6 w-6 text-red-500" />}
                title="Authentic Craftsmanship"
                description="Connect with real artisans and discover unique, handmade products with cultural significance"
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6 text-blue-500" />}
                title="Global Marketplace"
                description="Reach customers worldwide and showcase your cultural heritage on an international platform"
              />
            </div>
          </div>

          {/* Loading States */}
          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <GoogleLoaderWithText
                  size="xl"
                  text={`Loading ${isLoading} portal...`}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-16 border-t border-border">
            <div className="flex items-center justify-center space-x-8 text-muted-foreground mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Empowering artisans</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Preserving culture</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Building connections</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 AI Artisan Marketplace. Bridging tradition and technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
