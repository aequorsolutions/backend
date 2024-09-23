import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekSummary } from '../../functions/week/get-week-summary'
import { authenticate } from '../../plugins/authenticate'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/summary',
    {
      onRequest: [authenticate],
    },
    async request => {
      const userId = request.user.sub

      const { summary } = await getWeekSummary(userId)

      return { summary }
    }
  )
}
