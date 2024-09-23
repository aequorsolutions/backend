import { db } from '../../db'
import { categories } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function createCategory(name: string, userId: string) {
  const existingCategory = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1)
    .execute()

  if (existingCategory.length > 0) {
    return existingCategory[0].id
  }

  const [newCategory] = await db
    .insert(categories)
    .values({
      name,
      userId,
      createdAt: new Date(),
    })
    .returning({ id: categories.id })
    .execute()

  return newCategory.id
}
