'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          <span className="gradient-text">Create an Account</span>
        </h1>
        <div className="bg-card rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] gradient-hero" />
          <SignUpForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
