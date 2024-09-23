import dayjs from 'dayjs'
import { db } from '../../db'
import { categories, goalCompletions, goals } from '../../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

export async function getWeekPendingGoals(userId: string) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        type: goals.type,
        categoryId: goals.categoryId,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(
        and(
          eq(goals.ownersId, userId),
          eq(goals.type, 'weekly'),
          lte(goals.createdAt, lastDayOfWeek)
        )
      )
  )

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          eq(goalCompletions.userId, userId),
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      category: sql /*sql*/`
          (SELECT ${categories.name} FROM ${categories} WHERE ${categories.id} = ${goalsCreatedUpToWeek.categoryId})
        `.as('category'),
      desiredFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompletionCounts,
      eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id)
    )

  return { pendingGoals }
}
