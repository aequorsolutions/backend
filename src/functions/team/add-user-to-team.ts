import { db } from '../../db'
import { teamMembers } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

interface AddUserToTeamRequest {
  userId: string
  teamId: string
}

export async function addUserToTeam({ userId, teamId }: AddUserToTeamRequest) {
  const existingUser = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)))
    .execute()

  if (existingUser.length > 0) {
    return {
      message: 'O usuário já pertence a esse time',
    }
  }
  await db
    .insert(teamMembers)
    .values({
      userId,
      teamId,
    })
    .execute()

  // Retorna os dados da associação criada
  return { message: 'Usuário adicionado ao time com sucesso' }
}
