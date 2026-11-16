import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { optionalAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendSuccess } from '../../utils/response.js'
import {
  AVAILABLE_LANGUAGES,
  I18N_DICTIONARY,
  type SupportedLang,
} from './i18n.dictionary.js'

const i18nQuerySchema = z.object({
  lang: z.enum(['en', 'id', 'zh_cn']).optional(),
})

function resolveAcceptLanguage(header?: string): SupportedLang | null {
  if (!header) return null
  const normalized = header.toLowerCase()
  if (normalized.includes('zh')) return 'zh_cn'
  if (normalized.includes('id')) return 'id'
  if (normalized.includes('en')) return 'en'
  return null
}

export const i18nRouter = Router()

i18nRouter.get(
  '/strings',
  optionalAuth,
  validateRequest({ query: i18nQuerySchema }),
  async (req, res) => {
    const { lang: queryLang } = (req.validated?.query ?? {}) as { lang?: SupportedLang }
    let resolvedLang: SupportedLang | null = queryLang ?? null
    let source: 'query' | 'user_preference' | 'accept_language' | 'default' = queryLang
      ? 'query'
      : 'default'

    if (!resolvedLang && req.auth) {
      const [user] = await db
        .select({ preferredLang: users.preferredLang })
        .from(users)
        .where(eq(users.id, req.auth.userId))
        .limit(1)
      if (user) {
        resolvedLang = user.preferredLang
        source = 'user_preference'
      }
    }

    if (!resolvedLang) {
      const headerLang = resolveAcceptLanguage(req.headers['accept-language'])
      if (headerLang) {
        resolvedLang = headerLang
        source = 'accept_language'
      }
    }

    const lang = resolvedLang ?? 'en'
    sendSuccess(res, {
      lang,
      source,
      availableLanguages: AVAILABLE_LANGUAGES,
      strings: I18N_DICTIONARY[lang],
    })
  },
)
