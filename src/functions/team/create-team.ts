import { db } from '../../db'
import { teams, teamOwners } from '../../db/schema'

interface CreateTeamRequest {
  name: string
  ownerId: string
}

export async function createTeam({ name, ownerId }: CreateTeamRequest) {
  const createdTeam = await db
    .insert(teams)
    .values({
      name: name,
      createdAt: new Date(),
    })
    .returning({
      id: teams.id,
      name: teams.name,
    })
    .execute()

  const teamId = createdTeam[0].id

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
