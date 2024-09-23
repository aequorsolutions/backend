import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../../plugins/authenticate'
import { addTeamToGoal } from '../../../functions/team/add-team-to-goals'

export const addTeamToAGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/teams/add-goal',
    {
      onRequest: [authenticate],
      schema: {
        body: z.object({
          teamId: z.string(),
          goalId: z.string(),
        }),
      },
    },
    async request => {
      const { teamId, goalId } = request.body
      const userId = request.user.sub
      // console.log(userId)
      const { message } = await addTeamToGoal({
        teamId,
        goalId,
        userId,
      })

      return { message }
    }
  )
}
