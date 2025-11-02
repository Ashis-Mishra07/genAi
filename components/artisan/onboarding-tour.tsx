"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Headphones, Package, BarChart3, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to Artisan Marketplace! 🎨",
    description: "Your journey to showcase and sell beautiful crafts begins here",
    icon: <Sparkles className="h-16 w-16 text-blue-500" />,
    tips: [
      "Connect with customers who appreciate handmade quality",
      "Get AI-powered tools to grow your business",
      "Track sales and manage orders effortlessly",
    ]
  },
  {
    id: "quick-upload",
    title: "Quick Product Upload 📸",
    description: "Easiest way to list your products",
    icon: <Headphones className="h-16 w-16 text-blue-500" />,
    tips: [
      "Use Admin Support for quick uploads - just photo, name & price",
      "Our team helps create your listing within 24 hours",
      "Perfect when you want to focus on crafting, not tech",
    ]
  },
  {
    id: "full-control",
    title: "Create Products Yourself �",
    description: "Or take full control of your listings",
    icon: <Package className="h-16 w-16 text-blue-500" />,
    tips: [
      "Add detailed descriptions, multiple images, and pricing",
      "Generate AI product videos automatically",
      "Edit and update anytime as you need",
    ]
  },
  {
    id: "analytics",
    title: "Track Your Performance 📊",
    description: "Data-driven insights to grow your business",
    icon: <BarChart3 className="h-16 w-16 text-blue-500" />,
    tips: [
      "See real-time sales, revenue, and product views",
      "Understand which products customers love most",
      "Make informed decisions to boost your sales",
    ]
  },
  {
    id: "feedback",
    title: "Customer Feedback & Reviews 💬",
    description: "Build trust and improve your craft",
    icon: <MessageSquare className="h-16 w-16 text-blue-500" />,
    tips: [
      "Read customer reviews and ratings",
      "Respond to feedback to build relationships",
      "Use insights to create even better products",
    ]
  },
  {
    id: "profile",
    title: "Tell Your Story �",
    description: "Connect with customers through your journey",
    icon: <Users className="h-16 w-16 text-blue-500" />,
    tips: [
      "Share your origin story and craft techniques",
      "Upload photos showing your creative process",
      "Generate an artisan documentary video with AI",
    ]
  },
];

export function ArtisanOnboardingTour() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // FOR TESTING: Always show onboarding for all users
    // Comment out these 3 lines after testing:
    setTimeout(() => setIsOpen(true), 800);
    return;
    
    // PRODUCTION CODE (currently disabled for testing):
    // Uncomment the code below after testing is complete
    /*
    const isFirstLogin = localStorage.getItem("artisan_first_login") === "true";
    const hasCompletedOnboarding = localStorage.getItem("artisan_onboarding_completed") === "true";
    
    if (isFirstLogin && !hasCompletedOnboarding) {
      // Show onboarding after a brief delay
      setTimeout(() => setIsOpen(true), 800);
      // Clear the flag
      localStorage.removeItem("artisan_first_login");
    }
    */
  }, []);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = () => {
    setIsOpen(false);
    // Mark onboarding as completed
    localStorage.setItem("artisan_onboarding_completed", "true");
    // Redirect to dashboard
    router.push("/artisan/dashboard");
  };

  const currentSlideData = onboardingSlides[currentSlide];
  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/80 z-[100]"
          />

          {/* Onboarding Modal */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden"
            style={{
              border: "3px solid rgb(66, 133, 244)",
              boxShadow: "0 0 80px rgba(66, 133, 244, 0.5), 0 30px 90px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Animated Background Pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                backgroundImage: "radial-gradient(circle, rgb(66, 133, 244) 2px, transparent 2px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Content */}
            <div className="relative p-6 md:p-8">
              {/* Icon with Floating Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  y: [0, -10, 0]
                }}
                transition={{ 
                  scale: { type: "spring", damping: 12, delay: 0.2 },
                  rotate: { duration: 0.8, delay: 0.2 },
                  y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="flex items-center justify-center mb-6"
              >
                <div className="p-4 bg-blue-500/10 rounded-2xl backdrop-blur-sm border-2 border-blue-500/30 shadow-xl">
                  {currentSlideData.icon}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-3 text-center"
              >
                {currentSlideData.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-300 text-center text-base mb-6"
              >
                {currentSlideData.description}
              </motion.p>

              {/* Tips List */}
              <motion.div 
                className="space-y-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {currentSlideData.tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.6 + (index * 0.1),
                      type: "spring",
                      damping: 20
                    }}
                    className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/60 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-slate-200 text-sm leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Progress Dots */}
              <motion.div 
                className="flex justify-center gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                {onboardingSlides.map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: index === currentSlide ? 1.2 : 1,
                      backgroundColor: index === currentSlide ? "rgb(66, 133, 244)" : "rgb(100, 116, 139)",
                    }}
                    transition={{ type: "spring", damping: 20 }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-between gap-4"
              >
                <Button
                  onClick={handleBack}
                  disabled={currentSlide === 0}
                  variant="outline"
                  className="flex-1 bg-slate-800/50 hover:bg-slate-700 text-slate-300 border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed py-4 text-sm rounded-xl backdrop-blur-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                {isLastSlide ? (
                  <Button
                    onClick={handleGetStarted}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 text-sm rounded-xl shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                  >
                    Get Started! 🚀
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 text-sm rounded-xl shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </motion.div>

              {/* Slide Counter */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center text-slate-500 mt-3 text-xs"
              >
                {currentSlide + 1} of {onboardingSlides.length}
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Export function to restart onboarding
export function restartArtisanOnboarding() {
  localStorage.setItem("artisan_first_login", "true");
  window.location.href = "/artisan/dashboard";
}
