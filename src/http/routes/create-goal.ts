import { createGoal } from '../../functions/goal/create-goal'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../plugins/authenticate'

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/goals',
    {
      onRequest: [authenticate],
      schema: {
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
          categoryId: z.string().optional(),
          type: z.string().optional(),
        }),
      },
    },
    async request => {
      const {
        title,
        desiredWeeklyFrequency,
        categoryId = 'uncategorized-id',
        type = 'weekly',
      } = request.body
      const userId = request.user.sub
      // console.log(userId)
      const { goal } = await createGoal({
        title,
        desiredWeeklyFrequency,
        categoryId,
        userId,
        type,
      })

      return { goalId: goal.id }
    }
  )
}
