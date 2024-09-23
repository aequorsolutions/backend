import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { authenticate } from '../../plugins/authenticate'
import { getMonthPendingGoals } from '../../functions/month/get-month-pending-goal'

export const getMonthPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/pending-goals/month',
    {
      onRequest: [authenticate],
    },
    async request => {
      const userId = request.user.sub
      const { pendingGoals } = await getMonthPendingGoals(userId)

      return { pendingGoals }
    }
  )
}
