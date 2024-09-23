import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoalCompletion } from '../../functions/goal/create-goal-completion'
import { authenticate } from '../../plugins/authenticate'

export const createCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/completions',
    {
      onRequest: [authenticate],
      schema: {
        body: z.object({
          goalId: z.string(),
        }),
      },
    },
    async request => {
      const { goalId } = request.body
      const id = request.user.sub

      await createGoalCompletion({
        goalId,
        id,
      })
      return { message: 'Completada com sucesso' }
    }
  )
}
