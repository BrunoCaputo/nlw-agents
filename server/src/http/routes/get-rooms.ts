import { count, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { questions } from '../../db/schema/questions.ts'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    const roomsSchema = schema.rooms
    const questionsSchema = schema.questions

    const results = await db
      .select({
        id: roomsSchema.id,
        name: roomsSchema.name,
        createdAt: roomsSchema.createdAt,
        questionsCount: count(questions.id),
      })
      .from(roomsSchema)
      .leftJoin(questionsSchema, eq(questionsSchema.roomId, roomsSchema.id))
      .groupBy(roomsSchema.id, roomsSchema.name)
      .orderBy(roomsSchema.createdAt)

    return results
  })
}
