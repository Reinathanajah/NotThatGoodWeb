import { EN_STRINGS } from './locales/en.js'
import { ID_STRINGS } from './locales/id.js'
import type { I18nStrings, SupportedLang } from './locales/types.js'
import { ZH_CN_STRINGS } from './locales/zh_cn.js'

export {
  AVAILABLE_LANGUAGES,
  type I18nStrings,
  type SupportedLang,
} from './locales/types.js'

export const I18N_DICTIONARY: Record<SupportedLang, I18nStrings> = {
  en: EN_STRINGS,
  id: ID_STRINGS,
  zh_cn: ZH_CN_STRINGS,
}
