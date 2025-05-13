import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Create a type that extends HTMLMotionProps for button
type MotionButtonProps = HTMLMotionProps<"button">;

interface ButtonProps extends Omit<MotionButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  // Minecraft-inspired button styles
  const baseClasses = 'font-medium transition-all focus:outline-none flex items-center justify-center border-2 relative';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 border-wood-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 border-wood-dark',
    outline: 'bg-dirt-dark border-wood-dark hover:bg-dirt-light',
    ghost: 'bg-transparent hover:bg-white/10 border-transparent',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-1.5',
    lg: 'text-base px-6 py-2',
  };

  // Add Minecraft-style button shadow classes
  const shadowClasses = variant !== 'ghost' ? 'shadow-[inset_-2px_-4px_0px_0px_rgba(0,0,0,0.3),inset_2px_2px_0px_0px_rgba(255,255,255,0.2)]' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${shadowClasses} ${className}`;

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 2 }}
      className={combinedClasses}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
