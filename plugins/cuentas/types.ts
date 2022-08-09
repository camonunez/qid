import { z } from 'zod'

export const TokenBody = z.object({
	iat: z.number().optional(),
	nbf: z.number().optional(),
	exp: z.number().optional(),
	iss: z.string().optional(),
	sub: z.string().optional()
})
export type TokenBody = z.infer<typeof TokenBody>

export const Usuario = z.object({
	_id: z.string(),
	nombre: z.string(),
	apellido: z.string(),
	email: z.string()
})
export type Usuario = z.infer<typeof Usuario>

export const CredencialSesion = z.object({
	token: z.nullable(z.string()),
	decodificado: z.nullable(TokenBody),
	expConfianza: z.nullable(z.number())
})
export type CredencialSesion = z.infer<typeof CredencialSesion>

export const Sesion = z.object({
	usuario: z.nullable(Usuario.or(z.literal(false))),
	sinConexion: z.boolean()
})
export type Sesion = z.infer<typeof Sesion>
