'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInClient() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          <span className="gradient-text">Sign In</span>
        </h1>
        <div className="bg-card rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] gradient-hero" />
          <SignInForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
