import * as jose from 'jose'
import dayjs from './fecha'
import chalk from 'chalk'
import consolo from './consolo'

const algFirma = 'ES256'
const algEncriptacion = 'ECDH-ES'
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
			consolo.error(chalk.red(fx), e)
			throw { error: `No se pudo ${fx}`, detalle: e }
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
			consolo.error(chalk.red(fx), e)
			throw { error: `No se pudo ${fx}`, detalle: e }
		}
	},

	exportar: {
		firma: {
			async publica(llave: jose.KeyLike) {
				return await jose.exportSPKI(llave)
			},
			async privada(llave: jose.KeyLike) {
				return await jose.exportPKCS8(llave)
			}
		},
		encriptacion: {
			async publica(llave: jose.KeyLike) {
				return await jose.exportSPKI(llave)
			},
			async privada(llave: jose.KeyLike) {
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

	async encriptar(llavePublica: jose.KeyLike, json: jose.JWTPayload): Promise<string> {
		const fx = 'Cripto>encriptar'
		// consolo.log(fx)
		try {
			const encriptado = await new jose.EncryptJWT(json)
				.setProtectedHeader({ alg: algEncriptacion, enc: encEncriptacion })
				.encrypt(llavePublica)
			return encriptado
		} catch (e) {
			consolo.error(chalk.red(fx), e)
			throw { error: `No se pudo ${fx}`, detalle: e }
		}
	},
	async decriptar(llavePrivada: jose.KeyLike, JWTString: string) {
		const fx = 'Cripto>cripto.decriptar'
		consolo.log(fx)
		try {
			// const { payload, protectedHeader } = await jose.jwtDecrypt(JWTString, llavePrivada)
			const { payload } = await jose.jwtDecrypt(JWTString, llavePrivada)
			// console.log(fx, { payload, protectedHeader })
			return payload
		} catch (e) {
			consolo.error(chalk.red(fx), e)
			throw { error: `No se pudo ${fx}`, detalle: e }
		}
	},

	async firmar(llavePrivada: jose.KeyLike, cuerpo: jose.JWTPayload, issuer: string) {
		const fx = 'Cripto>firmar'
		try {
			const jwt = await new jose.SignJWT(cuerpo)
				.setProtectedHeader({ alg: algFirma })
				.setIssuedAt(dayjs().subtract(10, 's').unix())
				.setIssuer(issuer)
				.sign(llavePrivada)
			return jwt
		} catch (e) {
			consolo.error(chalk.red(fx), e)
			throw { error: `No se pudo ${fx}`, detalle: e }
		}
	},

	async verificar(llavePublica: jose.KeyLike, jwt: string, issuer: string) {
		const fx = 'Cripto>verificar'
		try {
			consolo.log(fx)
			const { payload } = await jose.jwtVerify(jwt, llavePublica, {
				issuer
			})
			return payload
		} catch (e: any) {
			// consolo.error(chalk.red(fx), 'code', e.code)
			if (!e.code) {
				consolo.error(chalk.red(fx), e)
				throw { error: e }
			}
			if (e.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') throw { error: 'token no pasó verificación de firma' }
			if (e.code === 'ERR_JWT_EXPIRED') throw { error: 'token expirado' }

			consolo.error(chalk.red(fx), e)
			throw { error: `No se pudo ${fx}`, detalle: e }
		}
	}
}

export default cripto
