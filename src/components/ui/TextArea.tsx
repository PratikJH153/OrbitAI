import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full bg-white/5 border border-glass-border rounded-lg px-4 py-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500/50' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-foreground/80">
          {label}
        </label>
      )}
      <textarea
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default TextArea;
