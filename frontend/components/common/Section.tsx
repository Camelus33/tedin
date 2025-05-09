import React from 'react';

type SectionVariant = 'default' | 'filled' | 'centered';
type SectionWidth = 'narrow' | 'normal' | 'wide';

const widthMap: Record<SectionWidth, string> = {
  narrow: 'max-w-3xl',
  normal: 'max-w-4xl',
  wide: 'max-w-6xl',
};

const variantMap: Record<SectionVariant, string> = {
  default: '',
  filled: 'bg-gray-800 rounded-lg shadow-xl',
  centered: 'text-center',
};

type SectionProps = {
  className?: string;
  innerClassName?: string;
  id?: string;
  title?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  variant?: SectionVariant;
  width?: SectionWidth;
  children: React.ReactNode;
};

export default function Section({
  id,
  title,
  icon: Icon,
  description,
  variant = 'default',
  width = 'normal',
  className = '',
  innerClassName,
  children,
}: SectionProps) {

  return (
    <section id={id} className={`py-12 md:py-16 ${variantMap[variant]} ${className}`}>      
      <div className={innerClassName || `${widthMap[width]} mx-auto px-4 sm:px-6 lg:px-8`}>        
        {(title || description) && (
          <header className={variant === 'centered' ? 'text-center mb-8' : 'mb-8'}>
            {Icon && <Icon className="inline-block mr-2 h-7 w-7 text-current" />}
            {title && <h2 className="inline text-3xl font-bold align-middle">{title}</h2>}
            {description && <p className="mt-2 text-gray-400 text-base">{description}</p>}
          </header>
        )}
        <div>
          {children}
        </div>
      </div>
    </section>
  );
} 