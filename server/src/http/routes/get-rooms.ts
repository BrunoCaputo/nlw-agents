import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    const roomsSchema = schema.rooms

    const results = await db
      .select({
        id: roomsSchema.id,
        name: roomsSchema.name,
      })
      .from(roomsSchema)
      .orderBy(roomsSchema.createdAt)

    return results
  })
}
