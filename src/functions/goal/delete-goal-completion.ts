import { eq, sql } from 'drizzle-orm'
import { db } from '../../db'
import { goalCompletions, goals, teamMembers } from '../../db/schema'

interface DeleteGoalCompletionRequest {
  completionId: string
  userId: string
}

export async function deleteGoalCompletion({
  completionId,
  userId,
}: DeleteGoalCompletionRequest) {
  // Verificação de autorização
  const isOwnerOrTeamMember = await db
    .select({
      isAuthorized: sql`EXISTS (
        SELECT 1
        FROM ${goalCompletions} gc
        LEFT JOIN ${goals} g ON g.id = gc.goal_id
        LEFT JOIN ${teamMembers} tm ON g.teams_id = tm.team_id
        WHERE gc.id = ${completionId} 
          AND (g.owners_id = ${userId} OR tm.user_id = ${userId})
      )`.as('isAuthorized'),
    })
    .from(goalCompletions)
    .where(eq(goalCompletions.id, completionId))
    .limit(1)

  // Verifica se o usuário está autorizado
  if (!isOwnerOrTeamMember[0]?.isAuthorized) {
    throw new Error('User is not authorized to delete this goal completion.')
  }

  // Deleta o registro de conclusão
  await db.delete(goalCompletions).where(eq(goalCompletions.id, completionId))

  return { message: 'Goal completion deleted successfully.' }
}
