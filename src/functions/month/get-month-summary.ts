import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../../db'
import { categories, goalCompletions, goals } from '../../db/schema'
import dayjs from 'dayjs'

export async function getMonthSummary(userId: string) {
  const firstDayOfWeek = dayjs().startOf('month').toDate()
  const lastDayOfWeek = dayjs().endOf('month').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(
        and(
          eq(goals.ownersId, userId),
          eq(goals.type, 'monthly'),
          lte(goals.createdAt, lastDayOfWeek)
        )
      )
  )

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        type: goals.type,
        category: sql /*sql*/`
          (SELECT ${categories.name} FROM ${categories} WHERE ${categories.id} = ${goals.categoryId})
        `.as('category'),
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql /*sql*/`
          DATE(${goalCompletions.createdAt})
        `.as('completedAtDate'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          eq(goals.ownersId, userId),
          eq(goals.type, 'monthly'),
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  )

  const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql /*sql*/`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInWeek.id},
              'title', ${goalsCompletedInWeek.title},
              'type', ${goalsCompletedInWeek.type},
              'category', ${goalsCompletedInWeek.category},
              'completedAt', ${goalsCompletedInWeek.completedAt}
            )
          )
        `.as('completions'),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
  )

  type GoalsPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }[]
  >

  const result = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed:
        sql /*sql*/`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
          Number
        ),
      total:
        sql /*sql*/`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql /*sql*/<GoalsPerDay>`
      JSON_AGG(
          JSON_BUILD_OBJECT(
            'completedAtDate',  ${goalsCompletedByWeekDay.completedAtDate},
            'completions',      ${goalsCompletedByWeekDay.completions}
          )
        )
      `,
    })
    .from(goalsCompletedByWeekDay)

  return {
    summary: result[0],
  }
}
