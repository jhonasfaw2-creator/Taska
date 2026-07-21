/**
 * Request validation schemas and middleware.
 *
 * Validators are implemented per route module using zod (or a
 * similar validation library) and mounted as middleware before
 * the corresponding controller.
 *
 * Example:
 *   import { z } from 'zod';
 *   import { validate } from '../middleware/validate';
 *
 *   export const createUserSchema = z.object({
 *     body: z.object({
 *       email: z.string().email(),
 *       password: z.string().min(8),
 *     }),
 *   });
 *
 *   // In routes:
 *   router.post('/users', validate(createUserSchema), createUser);
 */
export {};
