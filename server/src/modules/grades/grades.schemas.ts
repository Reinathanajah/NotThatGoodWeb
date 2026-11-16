import { z } from 'zod'

export const gradesOverviewQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
})
