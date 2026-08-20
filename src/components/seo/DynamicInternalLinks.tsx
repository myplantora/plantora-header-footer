import React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { collectionLinkProps } from "@/lib/collectionLink";

interface InternalLink {
  label: string;
  href: string;
  type: 'product' | 'collection' | 'page';
}

interface DynamicInternalLinksProps {
  currentHandle?: string;
  tags?: string[];
  type?: 'product' | 'collection';
  className?: string;
}

export function DynamicInternalLinks({ 
  currentHandle, 
  tags = [], 
  type = 'product',
  className 
}: DynamicInternalLinksProps) {
  // Logic to generate contextually relevant links based on tags/category
  // In a real app, this could be driven by a service or data mapping
  const generateLinks = (): InternalLink[] => {
    const links: InternalLink[] = [];
    
    // Add primary category links based on tags
    if (tags.some(t => t.toLowerCase().includes('indoor'))) {
      links.push({ label: 'Browse Indoor Plants', href: '/collections/indoor-plants', type: 'collection' });
    }
    if (tags.some(t => t.toLowerCase().includes('outdoor'))) {
      links.push({ label: 'Explore Outdoor Collection', href: '/collections/outdoor-plants', type: 'collection' });
    }
    
    // Add utility/educational links
    links.push({ label: 'Plant Care Guide', href: '/pages/about', type: 'page' });
    links.push({ label: 'Shipping & Delivery', href: '/pages/contact', type: 'page' });
    
    // Cross-sell collections
    if (type === 'product') {
      links.push({ label: 'Big Savings Combos', href: '/collections/big-savings-combos', type: 'collection' });
    }

    return links.filter(link => !link.href.includes(currentHandle || ''));
  };

  const links = generateLinks();

  if (links.length === 0) return null;

  return (
    <nav 
      aria-label="Contextual navigation" 
      className={cn("mt-8 border-t border-brand/10 pt-6", className)}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider text-brand/60 mb-3">
        Continue Exploring
      </h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {links.map((link) => {
          const isCollection = link.type === 'collection';
          const linkProps = isCollection ? collectionLinkProps(link.href.split('/').pop() || '') : { to: link.href };
          
          return (
            <Link
              key={link.href}
              {...(linkProps as any)}
              className="text-sm font-medium text-brand hover:text-accent transition-colors underline underline-offset-4 decoration-brand/20 hover:decoration-accent"
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
