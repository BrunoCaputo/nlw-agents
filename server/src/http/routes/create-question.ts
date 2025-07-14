import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateEmbeddings } from '../../services/gemini.ts'

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async ({ body, params }, reply) => {
      const { roomId } = params
      const { question } = body

      const embeddings = await generateEmbeddings(question)

      const embeddingsAsString = `[${embeddings.join(',')}]`

      const chunks = await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          similarity: sql<number> /*SQL*/`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
        })
        .from(schema.audioChunks)
        .where(
          and(
            eq(schema.audioChunks.roomId, roomId),
            sql /*SQL*/`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
          )
        )
        .orderBy(
          sql /*SQL*/`${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector`
        )
        .limit(3)

      return reply.status(200).send({ chunks })

      // const result = await db
      //   .insert(schema.questions)
      //   .values({ roomId, question })
      //   .returning()

      // const insertedQuestion = result[0]

      // if (!insertedQuestion) {
      //   throw new Error('Failed to create new question')
      // }

      // return reply.status(201).send({ questionId: insertedQuestion.id })
    }
  )
}
