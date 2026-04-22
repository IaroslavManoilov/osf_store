import { baseCompile } from '@intlify/message-compiler'
import ru from '../i18n/locales/ru'
import ro from '../i18n/locales/ro'
import en from '../i18n/locales/en'

function walk(obj: any, p = '') {
  for (const [k, v] of Object.entries(obj || {})) {
    const path = p ? `${p}.${k}` : k
    if (typeof v === 'string') {
      try {
        baseCompile(v)
      } catch (e: any) {
        console.log('ERR', path, '=>', JSON.stringify(v), '::', e?.code, e?.message)
      }
    } else if (v && typeof v === 'object') {
      walk(v, path)
    }
  }
}
walk(ru, 'ru')
walk(ro, 'ro')
walk(en, 'en')
console.log('done')
