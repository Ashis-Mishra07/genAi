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
  Globe,
  Heart,
  Zap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

// User will be managed by actual auth system

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
    className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 cursor-pointer transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:bg-card/80 backdrop-blur-sm">
    
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10">
      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300">
            <div className="w-2 h-2 bg-primary/60 rounded-full mr-3 group-hover:bg-primary group-hover:scale-125 transition-all duration-300"></div>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-all duration-300">
        <span>Get Started</span>
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </div>

    {/* Subtle accent */}
    <div className="absolute top-4 right-4 w-8 h-8 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  </div>
);

interface StatsCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StatsCard = ({ value, label, icon }: StatsCardProps) => (
  <div className="text-center">
    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 text-primary">
      {icon}
    </div>
    <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleSelect = async (role: "admin" | "artisan" | "customer") => {
    setIsLoading(role);
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
      <Navbar user={null} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-primary/10 backdrop-blur-sm rounded-2xl">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Artisan
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {" "}Marketplace
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Connect artisans with customers worldwide. Discover unique handmade treasures, 
              share cultural stories, and build meaningful connections in our thriving marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Button
                size="lg"
                onClick={() => router.push("/products")}
                className="px-8 py-4 text-lg"
              >
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/auth")}
                className="px-8 py-4 text-lg"
              >
                Join as Artisan
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatsCard
              value="10K+"
              label="Happy Customers"
              icon={<Users className="h-8 w-8" />}
            />
            <StatsCard
              value="500+"
              label="Talented Artisans"
              icon={<Palette className="h-8 w-8" />}
            />
            <StatsCard
              value="50+"
              label="Countries Served"
              icon={<Globe className="h-8 w-8" />}
            />
            <StatsCard
              value="99%"
              label="Satisfaction Rate"
              icon={<Heart className="h-8 w-8" />}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Our Marketplace?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're more than just a marketplace - we're a community that celebrates 
              craftsmanship and cultural heritage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="AI-Powered Matching"
              description="Smart algorithms connect customers with perfect artisan products based on preferences and cultural interests."
            />
            <FeatureCard
              icon={<Award className="h-6 w-6" />}
              title="Quality Guaranteed"
              description="Every product is carefully curated and quality-checked to ensure authentic craftsmanship."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Direct Communication"
              description="Chat directly with artisans to learn their stories and customize your perfect piece."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Global Reach"
              description="Discover unique crafts from around the world, shipped directly to your doorstep."
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6" />}
              title="Cultural Stories"
              description="Each product comes with the rich story of its cultural background and creation process."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Secure Transactions"
              description="Safe and secure payment processing with buyer protection and easy returns."
            />
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're an administrator, artisan, or customer, we have the perfect experience for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <RoleCard
              title="Admin"
              description="Manage the platform, oversee operations, and support the artisan community"
              icon={<Shield className="h-8 w-8" />}
              features={[
                "Platform management",
                "User oversight", 
                "Analytics dashboard",
                "System configuration",
              ]}
              gradient=""
              path="/auth/admin"
              onClick={() => handleRoleSelect("admin")}
            />

            <RoleCard
              title="Artisan"
              description="Showcase your crafts, tell your story, and connect with customers worldwide"
              icon={<Palette className="h-8 w-8" />}
              features={[
                "Product showcase",
                "Story creation",
                "Customer chat", 
                "Order management",
              ]}
              gradient=""
              path="/auth/artisan"
              onClick={() => handleRoleSelect("artisan")}
            />

            <RoleCard
              title="Customer"
              description="Discover unique handmade products and connect directly with talented artisans"
              icon={<ShoppingBag className="h-8 w-8" />}
              features={[
                "Browse products",
                "Chat with artisans",
                "Place orders",
                "Cultural stories",
              ]}
              gradient=""
              path="/auth/customer"
              onClick={() => handleRoleSelect("customer")}
            />
          </div>
        </div>
      </section>

      {/* Loading States */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 flex items-center space-x-4 border border-border shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-card-foreground font-medium">
              Loading {isLoading} portal...
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="ml-2 text-xl font-bold text-card-foreground">
                Artisan Marketplace
              </span>
            </div>
            <p className="text-muted-foreground">
              Empowering artisans • Preserving culture • Building connections
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
