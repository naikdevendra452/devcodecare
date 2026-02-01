// Contact form types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  service?: string;
  otherService?: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

// Portfolio types
export interface PortfolioItem {
  id: number;
  title: string;
  category: 'app' | 'web' | 'card';
  image: string;
  link?: string;
}

// Team member types
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  socials: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// Client types
export interface Client {
  id: number;
  name: string;
  logo: string;
}

// Counter stats types
export interface CounterStat {
  value: number;
  label: string;
}
