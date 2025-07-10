import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { questions } from '../../db/schema/questions.ts'

export const getRoomQuestionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async ({ params }) => {
      const { roomId } = params
      const schemaQuestions = schema.questions

      const result = await db
        .select({
          id: schemaQuestions.id,
          question: schemaQuestions.question,
          answer: schemaQuestions.answer,
          createdAt: schemaQuestions.createdAt,
        })
        .from(schemaQuestions)
        .where(eq(schemaQuestions.roomId, roomId))
        .orderBy(desc(questions.createdAt))

      return result
    }
  )
}
