import { createGoal } from '../../../functions/goal/create-goal'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../../plugins/authenticate'
import { createTeam } from '../../../functions/team/create-team'

export const createTeamRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/teams',
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
      // console.log(userId)
      const { team } = await createTeam({
        name,
        ownerId: userId,
      })

      return { teamId: team.id }
    }
  )
}
