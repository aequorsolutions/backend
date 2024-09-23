import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { listUserCategories } from '../../../functions/category/get-categories-summary'
import { authenticate } from '../../../plugins/authenticate'

export const getCategoriesSummaryRoute: FastifyPluginAsyncZod = async app => {
  // Define a rota com o parâmetro dinâmico ':userId'
  app.get(
    '/categories',
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const userId = request.user.sub
      // Verifique se o userId foi passado
      if (!userId) {
        return reply.status(400).send({ message: 'User ID is required' })
      }

      // Chame a função getCategoriesSummary passando o userId
      const { userCategories } = await listUserCategories(userId)

      return { userCategories }
    }
  )
}
