import { and, count, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../db'
import { goalCompletions, goals, teamMembers } from '../../db/schema'
import dayjs from 'dayjs'
import { sql } from 'drizzle-orm'

interface CreateGoalCompletionRequest {
  goalId: string
  id: string
}

export async function createGoalCompletion({
  goalId,
  id,
}: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const isOwnerOrTeamMember = await db
    .select({
      isAuthorized: sql`EXISTS (
      SELECT 1 
      FROM ${goals} g 
      LEFT JOIN ${teamMembers} tm ON g.teams_id = tm.team_id 
      WHERE g.id = ${goalId} AND (g.owners_id  = ${id} OR tm.user_id = ${id})
    )`.as('isAuthorized'),
    })
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1)
    .execute()

  if (!isOwnerOrTeamMember[0]?.isAuthorized) {
    throw new Error('User is not authorized to complete this goal.')
  }
  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week!')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId, userId: id })
    .returning()
  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
