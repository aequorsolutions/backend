import { db } from '../../db'
import { categories } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function createCategory(name: string, userId: string) {
  // Verifica se a categoria já existe
  const existingCategory = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1)
    .execute()

  if (existingCategory.length > 0) {
    // Se a categoria já existe, retorna o ID dela
    return existingCategory[0].id
  }

  // Se a categoria não existe, cria uma nova e retorna o ID gerado pelo banco de dados
  const [newCategory] = await db
    .insert(categories)
    .values({
      name,
      userId,
      createdAt: new Date(),
    })
    .returning({ id: categories.id }) // Retorna o ID da nova categoria
    .execute()

  return newCategory.id // Retorna o ID da nova categoria
}
