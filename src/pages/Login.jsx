import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { createPageUrl } from "@/utils";
import HospoLogo from "../components/HospoLogo";

export default function Login() {
  const { login, register, isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const intent = urlParams.get("intent") || "worker";

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = createPageUrl(intent === "employer" ? "EmployerDashboard" : "BrowseShifts");
    }
  }, [isAuthenticated, intent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        await register(email, password, intent, fullName);
      } else {
        await login(email, password);
      }
      window.location.href = createPageUrl(intent === "employer" ? "EmployerDashboard" : "BrowseShifts");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = intent === "employer" ? "Employer" : "Worker";

  return (
    <div className="min-h-screen px-6 py-12 flex items-center justify-center" style={{ backgroundColor: "#FAF8F5", fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Back link */}
        <a
          href={createPageUrl("Welcome")}
          className="inline-flex items-center gap-2 text-sm font-light mb-8 hover:opacity-70 transition-opacity"
          style={{ color: "#A67C6D" }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Welcome
        </a>

        {/* Card */}
        <div className="p-8 rounded-2xl" style={{ backgroundColor: "#FFFCF7", border: "1px solid #E8E3DC" }}>
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <HospoLogo size="md" />
          </div>

          <h2 className="text-3xl font-light text-center mb-2" style={{ fontFamily: "Crimson Pro, serif", color: "#705D56" }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm font-light text-center mb-8" style={{ color: "#A67C6D" }}>
            {isSignUp ? `Sign up as ${roleLabel}` : `Sign in as ${roleLabel}`}
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl text-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label className="text-sm font-light" style={{ color: "#705D56" }}>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#C89F8C" }} strokeWidth={1.5} />
                  <Input
                    type="text"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 rounded-xl border py-5 font-light"
                    style={{ borderColor: "#E8E3DC", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-light" style={{ color: "#705D56" }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#C89F8C" }} strokeWidth={1.5} />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 rounded-xl border py-5 font-light"
                  style={{ borderColor: "#E8E3DC", backgroundColor: "#FAF8F5" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-light" style={{ color: "#705D56" }}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#C89F8C" }} strokeWidth={1.5} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Min 8 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isSignUp ? 8 : undefined}
                  className="pl-10 pr-10 rounded-xl border py-5 font-light"
                  style={{ borderColor: "#E8E3DC", backgroundColor: "#FAF8F5" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#C89F8C" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-6 text-base font-normal tracking-wide transition-all duration-300"
              style={{
                backgroundColor: intent === "employer" ? "#705D56" : "#C89F8C",
                color: "white",
                border: "none",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* Toggle sign in / sign up */}
          <p className="text-center mt-6 text-sm font-light" style={{ color: "#A67C6D" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="underline font-normal"
              style={{ color: "#705D56" }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs font-light" style={{ color: "#C89F8C" }}>
          By signing in you agree to our{" "}
          <a href={createPageUrl("TermsAndConditions")} className="underline" style={{ color: "#A67C6D" }}>
            Terms &amp; Conditions
          </a>.
        </p>
      </div>
    </div>
  );
}
