import { z } from 'zod'

export const validadorEmail = z.string().email()
export const validadorPass = z.string().min(6)
export const validadorToken = z.string().min(10)
