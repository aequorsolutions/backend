import { client, db } from '.'
import {
  goalCompletions,
  goals,
  categories,
  teams,
  users,
  teamOwners,
  teamMembers,
} from './schema'
import dayjs from 'dayjs'

// ID fixo para a categoria "uncategorized"
const UNCATEGORIZED_ID = 'uncategorized-id'

async function seed() {
  // Limpar as tabelas
  await db.delete(goalCompletions)
  await db.delete(goals)
  await db.delete(categories)
  await db.delete(teamMembers)
  await db.delete(teamOwners)
  await db.delete(teams)
  await db.delete(users)

  // Inserir usuários
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: 'John Doe',
        email: 'john@example.com',
        googleId: 'google-id-1',
        avatarUrl: 'https://example.com/avatar1.png',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        googleId: 'google-id-2',
        avatarUrl: 'https://example.com/avatar2.png',
      },
    ])
    .returning()

  // Inserir categorias (incluindo a categoria UNCATEGORIZED)
  const insertedCategories = await db
    .insert(categories)
    .values([
      {
        name: 'Health',
      },
      {
        name: 'Productivity',
      },
      {
        name: 'Uncategorized',
        id: UNCATEGORIZED_ID,
      },
    ])
    .returning()

  // Inserir metas (goals)
  const insertedGoals = await db
    .insert(goals)
    .values([
      {
        title: 'Acordar cedo',
        desiredWeeklyFrequency: 5,
        categoryId: insertedCategories[0].id, // Categoria Health
        ownersId: insertedUsers[0].id,
        type: 'Monthly',
      },
      {
        title: 'Exercícios',
        desiredWeeklyFrequency: 3,
        categoryId: insertedCategories[0].id, // Categoria Health
        ownersId: insertedUsers[1].id,
        type: 'Weekly',
      },
      {
        title: 'Meditar',
        desiredWeeklyFrequency: 2,
        categoryId: insertedCategories[2].id, // Categoria Uncategorized
        ownersId: insertedUsers[0].id,
        type: 'Daily',
      },
    ])
    .returning()

  // Inserir completions para as metas
  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    {
      goalId: insertedGoals[0].id,
      userId: insertedUsers[0].id, // Usuário John Doe completou
      createdAt: startOfWeek.toDate(),
    },
    {
      goalId: insertedGoals[1].id,
      userId: insertedUsers[1].id, // Usuário Jane Smith completou
      createdAt: startOfWeek.add(1, 'day').toDate(),
    },
  ])
}

// Executa a função de seed e encerra o cliente
seed().finally(() => {
  client.end()
})
