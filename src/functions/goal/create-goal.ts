import { db } from '../../db'
import { goals } from '../../db/schema'

interface CreateGoalRequest {
  title: string
  desiredWeeklyFrequency: number
  categoryId: string
  userId: string
  type: string
}

export async function createGoal({
  title,
  desiredWeeklyFrequency,
  categoryId,
  userId,
  type,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredWeeklyFrequency,
      categoryId,
      ownersId: userId,
      type: type,
    })
    .returning()

  const goal = result[0]

  return {
    goal,
  }
}
