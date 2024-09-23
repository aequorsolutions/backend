import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../../plugins/authenticate'
import { addUserToTeam } from '../../../functions/team/add-user-to-team'

export const addUserToATeamRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/teams/add',
    {
      onRequest: [authenticate],
      schema: {
        body: z.object({
          teamId: z.string(),
        }),
      },
    },
    async request => {
      const { teamId } = request.body
      const userId = request.user.sub
      // console.log(userId)
      const { message } = await addUserToTeam({
        teamId,
        userId,
      })

      return { message }
    }
  )
}
