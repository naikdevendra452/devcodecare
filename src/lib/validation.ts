import { z } from 'zod';

// Contact form validation schema with strict rules
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters')
    .max(200, 'Subject must be less than 200 characters'),
  service: z
    .enum(['web', 'mobile', 'support', 'cloud', 'other'])
    .optional(),
  otherService: z.string().max(200).optional(),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate and sanitize contact form data
export function validateContactForm(data: unknown): {
  success: boolean;
  data?: ContactFormInput;
  errors?: Record<string, string>;
} {
  try {
    const parsed = contactFormSchema.parse(data);
    
    // Additional sanitization
    // Additional sanitization
    const sanitized: any = {
      name: sanitizeInput(parsed.name),
      email: sanitizeInput(parsed.email),
      subject: sanitizeInput(parsed.subject),
      message: sanitizeInput(parsed.message),
    };

    if (parsed.service) sanitized.service = sanitizeInput(parsed.service);
    if (parsed.otherService) sanitized.otherService = sanitizeInput(parsed.otherService);

    // If service is 'other', ensure otherService is present
    if (parsed.service === 'other' && (!parsed.otherService || parsed.otherService.trim().length < 2)) {
      return { success: false, errors: { otherService: 'Please specify the other service' } };
    }
    
    return { success: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Invalid form data' } };
  }
}
