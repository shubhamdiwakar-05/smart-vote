import React from 'react';
import { motion } from 'framer-motion';
import { SignIn } from '@clerk/react';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md flex justify-center"
      >
        <SignIn signUpUrl="/register" fallbackRedirectUrl="/dashboard" />
      </motion.div>
    </div>
  );
}
