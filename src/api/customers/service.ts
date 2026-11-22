import { ApiError, apiRequest } from '../client'

export interface MemberRegistration {
  fullName: string
  phone: string
  email?: string
  birthday?: string
  marketingConsent: boolean
}

export interface Member extends MemberRegistration {
  id: string
  status: 'ACTIVE' | 'LOCKED'
  /** True only when the server actually queued the welcome email. */
  welcomeEmailSent?: boolean
}

export const customerService = {
  async register(body: MemberRegistration): Promise<Member> {
    try {
      return await apiRequest<Member>('customers/register', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (error) {
      // 409 carries a customer-safe Vietnamese reason; 400 detail is Spring's English default.
      if (error instanceof ApiError && error.detail && error.status === 409)
        throw new ApiError(error.status, error.detail, error.detail, error.field)
      throw error
    }
  },
}
