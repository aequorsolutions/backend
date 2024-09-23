import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
      name: string
      avatarUrl: string
      googleId: string
      user_manager?: {
        sub: string
        name: string
        avatarUrl: string
      }
    }
  }
}
