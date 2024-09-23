import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../../functions/week/get-week-pending-goals'
import { authenticate } from '../../plugins/authenticate'

export const getWeekPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/pending-goals',
    {
      onRequest: [authenticate],
    },
    async request => {
      const userId = request.user.sub
      const { pendingGoals } = await getWeekPendingGoals(userId)

      return { pendingGoals }
    }
  )
}
