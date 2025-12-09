import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav 
      aria-label="مسار التنقل" 
      className={`flex items-center gap-1 text-sm flex-wrap ${className}`}
      dir="rtl"
    >
      {/* Home Link */}
      <Link 
        to="/" 
        className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>الرئيسية</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4 text-white/50" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
