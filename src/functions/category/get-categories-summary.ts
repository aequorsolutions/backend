import { db } from '../../db'
import { categories } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function listUserCategories(userId: string) {
  const userCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.createdAt)
    .execute()

  return { userCategories }
}
