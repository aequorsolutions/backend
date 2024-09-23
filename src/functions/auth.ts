import axios from 'axios'
import z from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

interface CreateTokenRequest {
  access_token: string
}

export async function createToken({ access_token }: CreateTokenRequest) {
  const userResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  )

  const userData = await userResponse.json()
  console.log(userData)

  const userInfoSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    picture: z.string().url(),
  })

  const userInfo = userInfoSchema.parse(userData)

  let user = await db
    .select()
    .from(users)
    .where(eq(users.googleId, userInfo.id))
    .execute()
    .then(rows => rows[0])

  if (!user) {
    const response = await db
      .insert(users)
      .values({
        googleId: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        avatarUrl: userInfo.picture,
        createdAt: new Date(),
      })
      .returning({ id: users.id })
      .execute()

    user = {
      id: response[0]?.id,
      googleId: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      avatarUrl: userInfo.picture,
      createdAt: new Date(),
    }
  }

  return {
    user,
  }
}
