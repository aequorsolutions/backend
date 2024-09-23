import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../../db'
import { categories, goalCompletions, goals } from '../../db/schema'
import dayjs from 'dayjs'

export async function getMonthSummary(userId: string) {
  const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
  const lastDayOfMonth = dayjs().endOf('month').format('YYYY-MM-DD')

  const goalsCreatedUpToMonth = db.$with('goals_created_up_to_month').as(
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
          lte(goals.createdAt, sql`DATE(${lastDayOfMonth})`)
        )
      )
  )

  const goalsCompletedInMonth = db.$with('goals_completed_in_month').as(
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
        weekOfMonth: sql /*sql*/`
  FLOOR(
    EXTRACT(DAY FROM ${goalCompletions.createdAt} - ${firstDayOfMonth}::date) / 7
  ) + 1
`.as('weekOfMonth'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          eq(goals.ownersId, userId),
          eq(goals.type, 'monthly'),
          gte(goalCompletions.createdAt, sql`DATE(${firstDayOfMonth})`),
          lte(goalCompletions.createdAt, sql`DATE(${lastDayOfMonth})`)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  )

  const goalsCompletedByWeek = db.$with('goals_completed_by_week').as(
    db
      .select({
        weekOfMonth: goalsCompletedInMonth.weekOfMonth,
        completions: sql /*sql*/`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInMonth.id},
              'title', ${goalsCompletedInMonth.title},
              'type', ${goalsCompletedInMonth.type},
              'category', ${goalsCompletedInMonth.category},
              'completedAt', ${goalsCompletedInMonth.completedAt}
            )
          )
        `.as('completions'),
      })
      .from(goalsCompletedInMonth)
      .groupBy(goalsCompletedInMonth.weekOfMonth)
      .orderBy(desc(goalsCompletedInMonth.weekOfMonth))
  )

  type GoalsPerWeek = {
    weekOfMonth: number
    completions: {
      id: string
      title: string
      type: string
      category: string
      completedAt: string
    }[]
  }[]

  const result = await db
    .with(goalsCreatedUpToMonth, goalsCompletedInMonth, goalsCompletedByWeek)
    .select({
      completed:
        sql /*sql*/`(SELECT COUNT(*) FROM ${goalsCompletedInMonth})`.mapWith(
          Number
        ),
      total:
        sql /*sql*/`(SELECT COALESCE(SUM(${goalsCreatedUpToMonth.desiredWeeklyFrequency}), 0) FROM ${goalsCreatedUpToMonth})`.mapWith(
          Number
        ),
      goalsPerWeek: sql /*sql*/<GoalsPerWeek>`COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'weekOfMonth', ${goalsCompletedByWeek.weekOfMonth},
            'completions', ${goalsCompletedByWeek.completions}
          )
        ), '[]'
      )`,
    })
    .from(goalsCompletedByWeek)

  return {
    summary: result[0],
  }
}
