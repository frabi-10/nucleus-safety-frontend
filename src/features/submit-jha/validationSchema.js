import { z } from 'zod';

export const jhaSchema = z.object({
  // Job/Task Information
  job_task: z.string().min(1, 'Job/Task name is required'),
  location: z.string().min(1, 'Building is required'),
  sub_location: z.string().min(1, 'Area is required'),
  specific_room: z.string().min(1, 'Specific location is required'),

  // Hazard Analysis
  hazards_identified: z.array(z.string()).min(1, 'At least one hazard must be identified'),
  risk_level: z.string().min(1, 'Risk level is required'),

  // Controls and Mitigations
  control_measures: z.array(z.string()).min(1, 'At least one control measure is required'),
  ppe_required: z.string().optional(),
  additional_controls: z.string().optional(),

  // Task Steps
  task_steps: z.string().min(1, 'Task steps are required'),

  // Priority
  priority: z.string().min(1, 'Priority is required'),

  // Optional Fields
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
  prepared_by: z.string().optional(),
  prepared_by_email: z.string().email('Invalid email').optional().or(z.literal('')),
  reviewed_by: z.string().optional(),
});
