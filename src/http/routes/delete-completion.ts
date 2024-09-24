import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { deleteGoalCompletion } from '../../functions/goal/delete-goal-completion'
import { authenticate } from '../../plugins/authenticate'

export const deleteCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/completions',
    {
      onRequest: [authenticate],
      schema: {
        body: z.object({
          completionId: z.string(), // Apenas completionId necessário
        }),
      },
    },
    async request => {
      const { completionId } = request.body
      const userId = request.user.sub // Identificação do usuário autenticado

      await deleteGoalCompletion({
        completionId,
        userId,
      })
      return { message: 'Deletada com sucesso' }
    }
  )
}
