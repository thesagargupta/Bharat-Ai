"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import BharatAiLogo from "../logo";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signingInWith, setSigningInWith] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSigningInWith("google");
    await signIn("google", { callbackUrl });
  };

  const handleGitHubSignIn = async () => {
    setIsSigningIn(true);
    setSigningInWith("github");
    await signIn("github", { callbackUrl });
  };

  if (status === "loading" || isSigningIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isSigningIn 
              ? `Signing in with ${signingInWith === "google" ? "Google" : "GitHub"}...` 
              : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BharatAiLogo size="md" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to Bharat AI</p>
          </div>

          {/* Sign In Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn && signingInWith === "google" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5"/>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={handleGitHubSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn && signingInWith === "github" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FaGithub className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Secure Authentication</span>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center text-sm text-gray-600">
            <p>By signing in, you agree to our</p>
            <p className="mt-1">
              <span className="text-purple-600 hover:underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-purple-600 hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Made With ❤️ by{" "}
          <a 
            href="https://sagarguptaportfolio.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 font-semibold hover:text-orange-600 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            Sagar Gupta
          </a>
        </p>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
