'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import OneTapComponent from '@/components/one-tap-component';
import Link from 'next/link';

interface HeroProps {
  openSidebar: () => void;
}

export default function Hero({ openSidebar }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.section
      className="relative overflow-hidden min-h-screen flex items-center"
      initial="hidden"
      animate="visible"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/sidebar_background_2.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="container mx-auto lg:mx-16 px-4 relative z-20">
        <motion.div className="max-w-3xl mx-6" variants={containerVariants}>
          <h1 className="text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight tracking-tighter inline-block">
            Streamlining
            <br />
            <span className="inline-block">Approvals</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl">
            Transform your workflow with streamlined approval management. Get
            instant visibility and control.
          </p>
          <Button
            onClick={openSidebar}
            className="flex items-center bg-white/95 text-forest hover:bg-white/90 text-lg h-12 pl-8 pr-4 rounded-full group"
          >
            <span className="flex-grow">Get Started</span>
            <span className="-mr-2 flex items-center justify-center h-10 w-10 rounded-full bg-forest text-white transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </motion.div>
      </div>
      <OneTapComponent />
    </motion.section>
  );
}
