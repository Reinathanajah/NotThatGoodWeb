import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendCreated, sendSuccess } from '../../utils/response.js'
import {
  conversationIdParamsSchema,
  conversationMessagesQuerySchema,
  sendMessageSchema,
} from './messages.schemas.js'
import * as messagesService from './messages.service.js'

export const messagesRouter = Router()

messagesRouter.use(requireAuth)

messagesRouter.get('/conversations', async (req, res) => {
  const items = await messagesService.listUserConversations(req.auth!.userId)
  sendSuccess(res, items)
})

messagesRouter.get(
  '/conversations/:id',
  validateRequest({
    params: conversationIdParamsSchema,
    query: conversationMessagesQuerySchema,
  }),
  async (req, res) => {
    const { id } = req.validated!.params as { id: string }
    const { offset, limit } = req.validated!.query as {
      offset: number
      limit: number
    }
    const result = await messagesService.getConversationMessages(
      req.auth!.userId,
      id,
      { offset, limit },
    )
    sendSuccess(
      res,
      {
        conversation: result.conversation,
        participants: result.participants,
        messages: result.messages,
      },
      { pagination: result.pagination },
    )
  },
)

messagesRouter.post(
  '/conversations/:id/messages',
  validateRequest({
    params: conversationIdParamsSchema,
    body: sendMessageSchema,
  }),
  async (req, res) => {
    const { id } = req.validated!.params as { id: string }
    const { body } = req.validated!.body as { body: string }
    const created = await messagesService.sendConversationMessage(
      req.auth!.userId,
      id,
      body,
    )
    sendCreated(res, created)
  },
)
