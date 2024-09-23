import { db } from '../../db'
import { categories } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function listUserCategories(userId: string) {
  // Consulta para obter todas as categorias criadas pelo usuário
  const userCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .where(eq(categories.userId, userId)) // Filtra as categorias pelo ID do usuário
    .orderBy(categories.createdAt) // Ordena pelas categorias mais antigas primeiro
    .execute()

  return { userCategories } // Retorna as categorias do usuário
}
