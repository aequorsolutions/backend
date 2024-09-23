import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { createCategory } from '../../../functions/category/create-category'
import { authenticate } from '../../../plugins/authenticate'

export const createCategoryRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/categories',
    {
      onRequest: [authenticate],
      schema: {
        body: z.object({
          name: z.string(),
        }),
      },
    },
    async request => {
      const { name } = request.body
      const userId = request.user.sub
      const response = await createCategory(name, userId)

      return { categoryId: response }
    }
  )
}
