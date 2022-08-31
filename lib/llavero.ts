import chalk from 'chalk'
import _ from 'lodash'
import type { JWTPayload, KeyLike } from 'jose'
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

type LlaveroObjeto = {
	id: string
	firma: ParDeLlaves
	encriptacion: ParDeLlaves
}

type ParDeLlavesExportado = {
	publica: string
}
type LlaveroExportado = {
	id: string
	firma: ParDeLlavesExportado
	encriptacion: ParDeLlavesExportado
}

type Llavero = {
	exportarLlavesPublicas(): Promise<LlaveroExportado>
	encriptar(mensaje: string): Promise<string>
	desencriptar(encriptado: string): Promise<string | undefined>
	firmarToken(cuerpo: JWTPayload): Promise<string>
	verificarFirmaToken(mensaje: string): Promise<JWTPayload>
}

type LlaveroInterno = Pick<Llavero, 'exportarLlavesPublicas' | 'desencriptar' | 'firmarToken'>

type LlaveroExterno = Pick<Llavero, 'encriptar' | 'verificarFirmaToken'>

// *---------*

function instanciadorLlavero(llaveroObjeto: LlaveroObjeto): Llavero {
	//
	const llavero: Llavero = {
		//
		async exportarLlavesPublicas() {
			const fx = 'Llavero.exportarLlavesPublicas'
			try {
				if (!llaveroObjeto) throw new Error(`${fx}: no hay llavero`)
				return {
					id: llaveroObjeto.id,
					firma: {
						publica: await cripto.exportar.firma.publica(llaveroObjeto.firma.publica)
					},
					encriptacion: {
						publica: await cripto.exportar.encriptacion.publica(llaveroObjeto.encriptacion.publica)
					}
				}
			} catch (e) {
				consolo.error(fx, e)
				throw 'No se pudo exportarLlavesPublicas'
			}
		},

		// Operaciones
		async encriptar(mensaje: string) {
			const fx = 'Llavero.encriptar'
			try {
				if (!llaveroObjeto) throw new Error(`${fx}: no hay llavero`)
				const llave = llaveroObjeto.encriptacion.publica
				if (!llave) throw 'Falta llave'
				return await cripto.encriptar(llave, mensaje)
			} catch (e) {
				consolo.error(fx, e)
				throw 'No se pudo encriptar'
			}
		},
		async desencriptar(encriptado: string) {
			const fx = 'Llavero.desencriptar'
			try {
				if (!llaveroObjeto) throw new Error(`${fx}: no hay llavero`)
				consolo.log(fx)
				const llave = llaveroObjeto.encriptacion.privada
				return llave && (await cripto.desencriptar(llave, encriptado))
			} catch (e) {
				consolo.error(fx, e)
				throw 'No se pudo desencriptar'
			}
		},
		async firmarToken(cuerpo: JWTPayload) {
			const fx = 'Llavero.firmarToken'
			try {
				if (!llaveroObjeto) throw new Error(`${fx}: no hay llavero`)
				consolo.log(fx, cuerpo)
				const llave = llaveroObjeto.firma.privada
				if (!llave) throw 'Falta llave'

				cuerpo.iss = llaveroObjeto.id
				const token = await cripto.firmarToken(llave, cuerpo, llaveroObjeto.id)
				return token
			} catch (e) {
				consolo.error(fx, e)
				throw 'No se pudo firmarToken'
			}
		},
		async verificarFirmaToken(token: string) {
			const fx = 'Llavero.verificarFirmaToken'
			try {
				if (!llaveroObjeto) throw new Error(`${fx}: no hay llavero`)
				consolo.log(fx)
				const llave = llaveroObjeto.firma.publica
				return llave && (await cripto.verificarFirmaToken(llave, token, llaveroObjeto.id))
			} catch (e) {
				if (typeof e === 'string') throw e
				consolo.error(fx, e)
				throw 'No se pudo verificarFirmaToken'
			}
		}
	}

	return llavero
}
function instanciadorLlaveroInterno(llaveroObjeto: LlaveroObjeto): LlaveroInterno {
	const llavero = instanciadorLlavero(llaveroObjeto)
	return {
		exportarLlavesPublicas: llavero.exportarLlavesPublicas,
		desencriptar: llavero.desencriptar,
		firmarToken: llavero.firmarToken
	}
}
function instanciadorLlaveroExterno(llaveroObjeto: LlaveroObjeto): LlaveroExterno {
	const llavero = instanciadorLlavero(llaveroObjeto)
	return {
		encriptar: llavero.encriptar,
		verificarFirmaToken: llavero.verificarFirmaToken
	}
}

let miLlaveroObj: LlaveroObjeto | undefined = undefined

export async function obtenerMiLlavero(): Promise<LlaveroInterno> {
	const fx = 'obtenerMiLlavero'
	if (miLlaveroObj) {
		return instanciadorLlaveroInterno(miLlaveroObj)
	}
	if (usarStores) {
		// Recuperar el llavero de la memoria local
		const llaveroMemoria = await llaveroStore.getItem<LlaveroObjeto>('miLlaveroObj')
		if (llaveroMemoria) {
			miLlaveroObj = llaveroMemoria
			consolo.log(`${fx}: llavero recuperado de la memoria local`)
			return instanciadorLlaveroInterno(miLlaveroObj)
		}
	}

	// Crear un llavero nuevo
	consolo.log(fx)
	const id = await MiniID()
	const llavesFirma = await cripto.crearKeysFirmas()
	const llavesEncriptacion = await cripto.crearKeysEncriptacion()

	miLlaveroObj = {
		id,
		firma: llavesFirma,
		encriptacion: llavesEncriptacion
	}

	if (usarStores) {
		await llaveroStore.setItem<LlaveroObjeto>('miLlaveroObj', miLlaveroObj)
	}

	return instanciadorLlaveroInterno(miLlaveroObj)
}

export async function importarLlavero({
	id,
	firma,
	encriptacion
}: {
	id: string
	firma: string
	encriptacion: string
}): Promise<LlaveroExterno> {
	const fx = 'importarLlavero'
	// Crear un llavero nuevo
	consolo.log(fx)
	const firmadoraPublica = await cripto.importar.firma.publica(firma)
	const encriptadoraPublica = await cripto.importar.encriptacion.publica(encriptacion)

	const llavero: LlaveroObjeto = {
		id,
		firma: { publica: firmadoraPublica },
		encriptacion: { publica: encriptadoraPublica }
	}

	const llaveroExterno = instanciadorLlaveroExterno(llavero)
	return llaveroExterno
}
