import { defineEventHandler } from 'h3'
import { issueCheckoutCsrf } from '../../utils/checkout-csrf'

export default defineEventHandler(async (event) => {
  return {
    success: true,
    csrfToken: issueCheckoutCsrf(event)
  }
})

