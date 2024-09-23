import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { createToken } from '../../functions/auth'
import '@fastify/jwt'
import { authenticate } from '../../plugins/authenticate'

export const createTokenRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/me',
    {
      onRequest: [authenticate],
    },
    async request => {
      return { user: request.user }
    }
  )

  app.post(
    '/users',
    {
      schema: {
        body: z.object({
          access_token: z.string(),
        }),
      },
    },
    async request => {
      const { access_token } = request.body
      // console.log(access_token)
      const response = await createToken({ access_token })
      console.log(response)
      const token = app.jwt.sign(
        {
          name: response.user.name,
          avatarUrl: response.user.avatarUrl,
          googleId: response.user.googleId,
        },
        {
          sub: response.user.id,
          expiresIn: '7 days',
        }
      )
      return { token }
    }
  )
}
