"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminAuthPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passcode || passcode.length !== 6) {
      setError("Please enter a valid 6-digit passcode");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid passcode");
      }

      // Store the tokens and redirect to admin dashboard
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("auth_token", data.accessToken); // Keep for compatibility
      localStorage.setItem("refresh_token", data.refreshToken); // Keep for compatibility
      localStorage.setItem("user_role", "ADMIN");

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setPasscode(value);
      setError(""); // Clear error when user starts typing
    }
  };

  return (
    <div className="min-h-screen bg-background/50 backdrop-blur-md flex items-center justify-center p-4 relative">
      {/* Background overlay for better blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background/80 to-blue-500/5" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to role selection
        </button>

        {/* Admin Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Access
            </h1>
            <p className="text-muted-foreground">
              Enter your 6-digit admin passcode to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="passcode"
                className="block text-sm font-medium text-foreground mb-2">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  id="passcode"
                  value={passcode}
                  onChange={handlePasscodeChange}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 text-center text-2xl font-mono tracking-widest transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPasscode ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-center">
                {passcode.length}/6 digits entered
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || passcode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "🛡️ Access Admin Panel"
              )}
            </button>
          </form>

          {/* Features Preview */}
          <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
            <h4 className="text-foreground font-semibold mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              Admin Capabilities
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Platform management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>User oversight</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>System configuration</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>🔒 Secure admin access with 6-digit verification</p>
          </div>
        </div>

        {/* Helper Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Don't have admin access? Contact the system administrator.</p>
        </div>
      </div>
    </div>
  );
}
