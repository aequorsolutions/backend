import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import jwt from '@fastify/jwt'

import { createGoalRoute } from './routes/create-goal'
import { createCompletionRoute } from './routes/create-completion'
import { getWeekPendingGoalsRoute } from './routes/get-week-pending-goals'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import { getCategoriesSummaryRoute } from './routes/category/get-categories-summary'
// import { createCategoryRoute } from './routes/category/create-category'

import fastifyCors from '@fastify/cors'
import { createTokenRoute } from './routes/auth'
// import { createTeamRoute } from './routes/team/create-team'
// import { addUserToATeamRoute } from './routes/team/add-user-to-team'
// import { addTeamToAGoalRoute } from './routes/team/add-team-to-goal'
import { getMonthPendingGoalsRoute } from './routes/get-month-pending-goals'
import { getMonthSummaryRoute } from './routes/get-month-summary'
import { createCategoryRoute } from './routes/category/create-category'
import { deleteCompletionRoute } from './routes/delete-completion'

async function bootstrap() {
  const app = fastify().withTypeProvider<ZodTypeProvider>()

  await app.register(fastifyCors, {
    origin: '*',
  })
  const SECRET = 'process.env.JWT_SECRET'

  await app.register(jwt, {
    secret: SECRET as string,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(createTokenRoute)

  // app.register(createTeamRoute)
  // app.register(addUserToATeamRoute)
  // app.register(addTeamToAGoalRoute)

  app.register(createGoalRoute)
  app.register(createCompletionRoute)
  app.register(deleteCompletionRoute)

  app.register(getWeekPendingGoalsRoute)
  app.register(getWeekSummaryRoute)

  app.register(getMonthPendingGoalsRoute)
  app.register(getMonthSummaryRoute)

  app.register(getCategoriesSummaryRoute)
  app.register(createCategoryRoute)

  app
    .listen({
      port: 3333,
      host: '0.0.0.0',
    })
    .then(() => {
      console.log('HTTP server running!')
    })
}
bootstrap()
