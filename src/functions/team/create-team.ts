import { db } from '../../db'
import { teams, teamOwners } from '../../db/schema'

interface CreateTeamRequest {
  name: string
  ownerId: string
}

export async function createTeam({ name, ownerId }: CreateTeamRequest) {
  // Primeiro, cria o time
  const createdTeam = await db
    .insert(teams)
    .values({
      name: name,
      createdAt: new Date(), // Insere a data de criação
    })
    .returning({
      id: teams.id,
      name: teams.name,
    })
    .execute()

  const teamId = createdTeam[0].id

  // Em seguida, adiciona o owner do time
  await db
    .insert(teamOwners)
    .values({
      teamId: teamId,
      userId: ownerId,
    })
    .execute()

  return {
    team: createdTeam[0],
  }
}
