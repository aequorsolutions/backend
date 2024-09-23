import { db } from '../../db'
import { goals } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

interface AddTeamToGoalRequest {
  userId: string
  goalId: string
  teamId: string
}

export async function addTeamToGoal({
  goalId,
  teamId,
  userId,
}: AddTeamToGoalRequest) {
  const isOwner = await db
    .select({ isOwner: eq(goals.ownersId, userId) })
    .from(goals)
    .where(eq(goals.id, goalId))
    .execute()

  if (!isOwner[0]?.isOwner) {
    throw new Error('O usuário não é o dono da meta.')
  }
  const existingGoal = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.teamsId, teamId)))
    .execute()

  if (existingGoal.length > 0) {
    return {
      message: 'O time já pertence a esta meta',
    }
  }
  await db
    .update(goals)
    .set({ teamsId: teamId })
    .where(eq(goals.id, goalId))
    .execute()

  return {
    message: 'Time adicionado à meta com sucesso',
  }
}
