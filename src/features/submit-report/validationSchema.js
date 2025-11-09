import { z } from 'zod';

export const reportSchema = z.object({
  type: z.string().min(1, 'Please select a report type'),
  location: z.string().min(1, 'Please select a building'),
  sub_location: z.string().min(1, 'Please select an area'),
  specific_room: z.string().min(1, 'Please select a specific location'),
  incident_datetime: z.string().min(1, 'Please select when the incident occurred'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  immediate_actions: z.array(z.string()).optional(),
  actions_taken: z
    .string()
    .max(500, 'Actions taken must not exceed 500 characters')
    .optional(),
  observer_name: z.string().max(100, 'Name must not exceed 100 characters').optional(),
  observer_email: z
    .string()
    .email('Invalid email address')
    .or(z.literal(''))
    .optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
});
