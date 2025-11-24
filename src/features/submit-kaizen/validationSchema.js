import { z } from 'zod';

export const kaizenSchema = z.object({
  // Category
  category: z.string().min(1, 'Category is required'),

  // Current State & Improvement
  current_state: z.string().min(10, 'Please describe the current problem (at least 10 characters)'),
  proposed_improvement: z.string().min(10, 'Please describe your proposed improvement (at least 10 characters)'),

  // Benefits & Cost
  expected_benefits: z.array(z.string()).min(1, 'Select at least one expected benefit'),
  implementation_cost: z.string().min(1, 'Implementation cost estimate is required'),

  // Collaborators & Details
  collaborators: z.string().optional(),
  department: z.string().optional(),

  // Priority (optional for Kaizen, defaults to Medium)
  priority: z.string().optional(),

  // Photos
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),

  // Submitter Info
  submitted_by: z.string().optional(),
  submitted_by_email: z.string().email('Invalid email').optional().or(z.literal('')),
});
