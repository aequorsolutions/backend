import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { authenticate } from '../../plugins/authenticate'
import { getMonthSummary } from '../../functions/month/get-month-summary'

export const getMonthSummaryRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/summary/month',
    {
      onRequest: [authenticate],
    },
    async request => {
      const userId = request.user.sub

      const { summary } = await getMonthSummary(userId)

      return { summary }
    }
  )
}
