import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { listUserCategories } from '../../../functions/category/get-categories-summary'
import { authenticate } from '../../../plugins/authenticate'

export const getCategoriesSummaryRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/categories',
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const userId = request.user.sub
      if (!userId) {
        return reply.status(400).send({ message: 'User ID is required' })
      }

      const { userCategories } = await listUserCategories(userId)

      return { userCategories }
    }
  )
}
