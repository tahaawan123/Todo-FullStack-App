'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/components/auth/AuthProvider';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const features = [
  {
    icon: CheckCircle,
    title: 'Smart Tasks',
    description: 'Create, organize, and prioritize your tasks with an intuitive interface designed for productivity.',
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Your tasks sync instantly across all your devices. Never miss a beat, wherever you are.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected. Only you can access your tasks and personal information.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Visualize your productivity with progress bars and completion stats to stay motivated.',
  },
];

const testimonials = [
  {
    quote: "This app completely transformed how I manage my daily tasks. The interface is clean and the animations make it a joy to use.",
    name: 'Sarah Chen',
    role: 'Product Designer',
  },
  {
    quote: "Finally a todo app that doesn't get in the way. Simple, fast, and beautiful. I've tried dozens and this is the one that stuck.",
    name: 'Marcus Johnson',
    role: 'Software Engineer',
  },
  {
    quote: "The progress tracking feature keeps me motivated. Seeing that completion bar fill up is incredibly satisfying.",
    name: 'Elena Rodriguez',
    role: 'Project Manager',
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold gradient-text">Todo App</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium rounded-lg gradient-hero text-white hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium rounded-lg gradient-hero text-white hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-start/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-end/20 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6"
          >
            Organize your life,{' '}
            <span className="gradient-text">one task at a time</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            A beautiful, fast, and secure task manager that helps you stay on top of everything. Built for people who value simplicity.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="px-8 py-3 text-lg font-semibold rounded-xl gradient-hero text-white hover:opacity-90 transition-opacity shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/signin"
              className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-border hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
            >
              Everything you need to{' '}
              <span className="gradient-text">stay productive</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Powerful features wrapped in a simple, delightful experience.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-16"
          >
            Loved by <span className="gradient-text">productive people</span>
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                className="p-6 rounded-xl bg-card border border-border shadow-sm"
              >
                <p className="text-muted-foreground mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center rounded-2xl gradient-hero p-12 shadow-xl"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get organized?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of people who use our app to manage their tasks and boost their productivity.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 text-lg font-semibold rounded-xl bg-white text-foreground hover:bg-white/90 transition-colors shadow-lg"
          >
            Start for Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Todo App. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/signin" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
