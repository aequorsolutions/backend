import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  googleId: text('google_id'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const teams = pgTable('teams', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const teamOwners = pgTable('team_owners', {
  teamId: text('team_id')
    .references(() => teams.id)
    .notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
})

export const teamMembers = pgTable('team_members', {
  teamId: text('team_id')
    .references(() => teams.id)
    .notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
})

export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  userId: text('user_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const goals = pgTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  type: text('type').notNull(),
  desiredWeeklyFrequency: integer('desired_frequency').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  ownersId: text('owners_id')
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  teamsId: text('teams_id').references(() => teams.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const goalCompletions = pgTable('goal_completions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  goalId: text('goal_id')
    .references(() => goals.id)
    .notNull(),
  userId: text('user_id')
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
