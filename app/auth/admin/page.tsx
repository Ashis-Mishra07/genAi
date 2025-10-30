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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground mb-8 transition-all duration-300 group">
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to role selection
        </button>

        {/* Admin Auth Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Admin Access</h1>
            <p className="text-muted-foreground">Enter your secure 6-digit passcode</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label
                htmlFor="passcode"
                className="block text-sm font-medium text-foreground mb-3">
                Admin Passcode
              </label>
              <div className="relative group">
                <input
                  type={showPasscode ? "text" : "password"}
                  id="passcode"
                  value={passcode}
                  onChange={handlePasscodeChange}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full px-6 py-4 bg-background border-2 border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-2xl font-mono tracking-[0.5em] transition-all duration-300 hover:border-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 p-1 rounded-lg hover:bg-muted">
                  {showPasscode ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {passcode.length}/6 digits entered
                </span>
                <div className="flex space-x-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < passcode.length
                          ? 'bg-primary shadow-sm'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive text-sm flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-destructive/20 flex-shrink-0 mt-0.5"></div>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || passcode.length !== 6}
              className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-2xl font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3"></div>
                  Verifying Access...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Access Admin Panel
                </div>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-primary">Secure 6-digit verification</span>
            </div>
          </div>
        </div>

        {/* Helper Info */}
        <div className="mt-8 text-center">
          <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">
              Need admin access? Contact your system administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
