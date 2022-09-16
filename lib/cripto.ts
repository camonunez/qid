import * as jose from 'jose'
import type { KeyLike, JWTPayload } from 'jose'
import dayjs from './fechas'
// import chalk from 'chalk'
import consolo from './consolo'

const algFirma = 'RS256'
const encFirma = 'A256GCM'
const algEncriptacion = 'RSA-OAEP-256'
const encEncriptacion = 'A256GCM'

const cripto = {
	async crearKeysFirmas() {
		const fx = 'Cripto>crearKeysFirmas'
		try {
			// consolo.log(fx)
			const { publicKey: publica, privateKey: privada } = await jose.generateKeyPair(algFirma)
			// consolo.log(fx, { publica, privada })
			return { publica, privada }
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	},

	async crearKeysEncriptacion() {
		const fx = 'Cripto>crearKeysEncriptacion'
		try {
			// consolo.log(fx)
			const { publicKey: publica, privateKey: privada } = await jose.generateKeyPair(algEncriptacion)
			// consolo.log(fx, { publica, privada })
			return { publica, privada }
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	},

	exportar: {
		firma: {
			async publica(llave: KeyLike) {
				return await jose.exportSPKI(llave)
			},
			async privada(llave: KeyLike) {
				return await jose.exportPKCS8(llave)
			}
		},
		encriptacion: {
			async publica(llave: KeyLike) {
				return await jose.exportSPKI(llave)
			},
			async privada(llave: KeyLike) {
				return await jose.exportPKCS8(llave)
			}
		}
	},
	importar: {
		firma: {
			async publica(spki: string) {
				return await jose.importSPKI(spki, algFirma, { extractable: true })
			},
			async privada(pkcs8: string) {
				return await jose.importPKCS8(pkcs8, algFirma, { extractable: true })
			}
		},
		encriptacion: {
			async publica(spki: string) {
				return await jose.importSPKI(spki, algEncriptacion, {
					extractable: true
				})
			},
			async privada(pkcs8: string) {
				return await jose.importPKCS8(pkcs8, algEncriptacion, {
					extractable: true
				})
			}
		}
	},

	async encriptar(llavePublica: KeyLike, mensaje: string): Promise<string> {
		const fx = 'Cripto>cripto.encriptar'
		// consolo.log(fx)
		try {
			const encriptado = await new jose.CompactEncrypt(new TextEncoder().encode(mensaje))
				.setProtectedHeader({ alg: algEncriptacion, enc: encEncriptacion })
				.encrypt(llavePublica)
			return encriptado
		} catch (e) {
			consolo.error(fx, e)
			throw (e)
		}
	},
	async desencriptar(llavePrivada: KeyLike, jwe: string): Promise<string> {
		const fx = 'Cripto>cripto.desencriptar'
		// consolo.log(fx)
		try {
			const { plaintext } = await jose.compactDecrypt(jwe, llavePrivada)
			const decodificado = new TextDecoder().decode(plaintext)
			return decodificado
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	},

	async firmarToken(llavePrivada: jose.KeyLike, cuerpo: JWTPayload, issuer: string): Promise<string> {
		const fx = 'Cripto>cripto.firmarToken'
		try {
			const jwt = await new jose.SignJWT(cuerpo)
				.setProtectedHeader({ alg: algFirma, enc: encFirma })
				.setIssuedAt(dayjs().subtract(10, 's').unix())
				.setIssuer(issuer)
				// .setAudience(audience)
				// .setExpirationTime('2h')
				.sign(llavePrivada)
			return jwt
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo firmarToken'
		}
	},

	async verificarFirmaToken(llavePublica: jose.KeyLike, jwt: string, issuer: string): Promise<JWTPayload> {
		const fx = 'Cripto>cripto.verificarFirmaToken'
		try {
			const { payload } = await jose.jwtVerify(jwt, llavePublica, {
				issuer
			})
			// console.log(protectedHeader)
			// console.log(payload)
			return payload
		} catch (e: any) {
			if (!e.code) {
				consolo.error(fx, e)
				throw e
			}
			if (e.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') throw 'token no pasó verificación'
			if (e.code === 'ERR_JWT_EXPIRED') throw 'token expirado'

			consolo.error(fx, e)
			throw e
		}
	}
}

export default cripto
