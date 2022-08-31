import chalk from 'chalk'
import _ from 'lodash'
import type { KeyLike } from 'jose'
import localforage from 'localforage'

import consolo from './consolo'
import cripto from './cripto'
import MiniID from './miniid'

const usarStores = true
const llaveroStore = localforage.createInstance({ name: 'llaveroStore' })

type ParDeLlaves = {
	publica: KeyLike
	privada?: KeyLike
}

type miLlavero = {
	id: string
	firma: ParDeLlaves
	encriptacion: ParDeLlaves
} | undefined

type TokenBody = {
	iat?: number
	nbf?: number
	exp?: number
	iss?: string
	sub?: string
}

let miLlavero: miLlavero = undefined

const Llavero = {
	async init() {
		const fx = `Llavero.init`
		try {
			if (usarStores) {
				// Recuperar el llavero de la memoria local
				const llaveroMemoria = await llaveroStore.getItem<miLlavero>('miLlavero')
				if (llaveroMemoria) {
					miLlavero = llaveroMemoria
					consolo.log(`${fx}: llavero recuperado de la memoria local`)
					return
				}
			}

			// Crear un llavero nuevo
			consolo.log(fx)
			const id = await MiniID()
			const llavesFirma = await cripto.crearKeysFirmas()
			const llavesEncriptacion = await cripto.crearKeysEncriptacion()
			miLlavero = {
				id,
				firma: llavesFirma,
				encriptacion: llavesEncriptacion,
			}
			if (usarStores) await llaveroStore.setItem<miLlavero>('miLlavero', miLlavero)
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	},

	async exportarLlavesPublicas() {
		const fx = `Llavero.exportarLlavesPublicas`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			const llaves = {
				firma: {
					publica: await cripto.exportar.firma.publica(miLlavero.firma.publica)
				},
				encriptacion: {
					publica: await cripto.exportar.encriptacion.publica(miLlavero.encriptacion.publica)
				}
			}
			return llaves
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo exportarLlavesPublicas'
		}
	},

	// Operaciones

	async encriptar(mensaje: string) {
		const fx = `Llavero.encriptar`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			const llave = miLlavero.encriptacion.publica
			if (!llave) throw 'Falta llave'
			return await cripto.encriptar(llave, mensaje)
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo encriptar'
		}
	},

	async desencriptar(encriptado: string) {
		const fx = `Llavero.desencriptar`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			consolo.log(fx)
			const llave = miLlavero.encriptacion.privada
			return llave && (await cripto.desencriptar(llave, encriptado))
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo desencriptar'
		}
	},

	async firmarToken(cuerpo: TokenBody) {
		const fx = `Llavero.firmarToken`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			consolo.log(fx, cuerpo)
			const llave = miLlavero.firma.privada
			if (!llave) throw 'Falta llave'

			cuerpo.iss = miLlavero.id
			const token = await cripto.firmarToken(llave, cuerpo, miLlavero.id)
			return token
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo firmarToken'
		}
	},

	async verificarFirmaToken(token: string) {
		const fx = `Llavero.verificarFirmaToken`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			consolo.log(fx)
			const llave = miLlavero.firma.publica
			return (
				llave &&
				(await cripto.verificarFirmaToken(llave, token, miLlavero.id))
			)
		} catch (e) {
			if (typeof e === 'string') throw e
			consolo.error(fx, e)
			throw 'No se pudo verificarFirmaToken'
		}
	},

	async crearToken(body: TokenBody) {
		const fx = `Llavero.crearToken`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			consolo.log(fx, body)
			const llave = miLlavero.firma.privada
			if (!llave) throw 'Falta llave'
			body.iss = miLlavero.id
			return await cripto.firmarToken(llave, body, miLlavero.id)
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo crearToken'
		}
	},

	async verificarToken(token: string) {
		const fx = `Llavero.verificarToken`
		try {
			if (!miLlavero) throw new Error(`${fx}: no hay llavero`)
			const llave = miLlavero.firma.publica
			const ok = llave && (await cripto.verificarFirmaToken(llave, token, miLlavero.id))
			consolo.log(chalk.green(fx))
			return ok
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo verificarToken'
		}
	}
}

export default Llavero
