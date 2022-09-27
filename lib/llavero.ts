'use strict'
import _ from 'lodash'
import type { JWTPayload, KeyLike } from 'jose'

import consolo from './consolo'
import cripto from './cripto'
import MiniID from './miniid'

type ParDeLlaves = {
	publica: KeyLike
	privada?: KeyLike
}
interface LlaveroCripto {
	_id: string
	_llavesFirma: ParDeLlaves
	_llavesEncriptacion: ParDeLlaves
}


type ParDeLlavesInternas = {
	publica: KeyLike
	privada: KeyLike
}

interface LlaveroCriptoInterno {
	_id: string
	_llavesFirma: ParDeLlavesInternas
	_llavesEncriptacion: ParDeLlavesInternas
}
export interface LlaveroAlmacenable {
	_id: string
	firma: {
		publica: string
		privada: string
	}
	encriptacion: {
		publica: string
		privada: string
	}
}

export interface LlaveroPublico {
	_id: string
	firma: string
	encriptacion: string
}
class Llavero {
	_id: string
	_llavesFirma: ParDeLlaves
	_llavesEncriptacion: ParDeLlaves

	constructor({_id, _llavesFirma, _llavesEncriptacion}: LlaveroCripto) {
		this._id = _id
		this._llavesFirma = _llavesFirma
		this._llavesEncriptacion = _llavesEncriptacion
	}

	async verificar(token: string) {
		const fx = 'Llavero.verificar'
		try {
			consolo.log(fx)
			if (!this._llavesFirma) throw { error: 'No existen llaves de firma' }

			const llave = this._llavesFirma.publica
			return llave && (await cripto.verificar(llave, token, this._id))
		} catch (e) {
			if (!_.isError(e)) throw e
			if (typeof e === 'string') throw e
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}
}

export class LlaveroExterno extends Llavero {

	static async instanciar({ _id, firma, encriptacion }: LlaveroPublico) {
		const fx = 'LlaveroExterno.instanciar'
		try {
			// Pasar llaves de string a keylike
			const firmaReinstanciada: ParDeLlaves = {
				publica: await cripto.importar.firma.publica(firma)
			}

			const encriptacionReinstanciada: ParDeLlaves = {
				publica: await cripto.importar.encriptacion.publica(encriptacion)
			}

			// Reinstanciar llavero
			const llavero = new LlaveroExterno({_id, _llavesFirma: firmaReinstanciada, _llavesEncriptacion: encriptacionReinstanciada})

			return llavero
		} catch (e) {
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}

	async encriptar(cuerpo: JWTPayload) {
		const fx = 'LlaveroExterno.encriptar'
		try {
			if (!this._llavesEncriptacion) throw { error: 'No existen llaves de encriptación' }

			// consolo.log(fx, mensaje)
			const llave = this._llavesEncriptacion.publica
			if (!llave) throw { error: 'falta llave de encriptación' }
			return await cripto.encriptar(llave, cuerpo)
		} catch (e) {
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}
}

export class LlaveroInterno extends Llavero {
	_llavesFirma: ParDeLlavesInternas
	_llavesEncriptacion: ParDeLlavesInternas

	constructor({_id, _llavesFirma, _llavesEncriptacion}: LlaveroCriptoInterno) {
		super({_id, _llavesFirma, _llavesEncriptacion})
		this._id = _id
		this._llavesFirma = _llavesFirma
		this._llavesEncriptacion = _llavesEncriptacion
	}

	static async crear(_id?: string) {
		const fx = 'LlaveroInterno.crear'
		try {
			if (!_id) _id = await MiniID()
			consolo.log(fx)
			const _llavesFirma = await cripto.crearKeysFirmas()
			const _llavesEncriptacion = await cripto.crearKeysEncriptacion()
			return new LlaveroInterno({_id, _llavesFirma, _llavesEncriptacion})
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	static async reinstanciar({ _id, firma, encriptacion }: LlaveroAlmacenable) {
		const fx = 'LlaveroInterno.reinstanciar'
		try {
			consolo.log(fx)
			// Pasar llaves de string a keylike
			const firmaReinstanciada = {
				publica: await cripto.importar.firma.publica(firma.publica),
				privada: await cripto.importar.firma.privada(firma.privada)
			}

			const encriptacionReinstanciada = {
				publica: await cripto.importar.encriptacion.publica(encriptacion.publica),
				privada: await cripto.importar.encriptacion.privada(encriptacion.privada)
			}

			// Reinstanciar llavero
			const llavero = new LlaveroInterno({_id, _llavesFirma: firmaReinstanciada, _llavesEncriptacion: encriptacionReinstanciada})

			return llavero
		} catch (e) {
			if (!_.isError(e)) throw e
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}

	async decriptar(encriptado: string): Promise<any> {
		const fx = 'LlaveroInterno.decriptar'
		try {
			consolo.log(fx)
			if (!this._llavesEncriptacion) throw { error: 'No existen llaves de encriptación' }

			const llave = this._llavesEncriptacion.privada
			return llave && (await cripto.decriptar(llave, encriptado))
		} catch (e) {
			if (!_.isError(e)) throw e
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}

	// Exportación

	async exportar(): Promise<LlaveroAlmacenable> {
		const fx = 'LlaveroInterno.exportar'
		consolo.log(fx)
		try {
			if (!this._llavesFirma) throw { error: 'No existen llaves de firma' }
			if (!this._llavesEncriptacion) throw { error: 'No existen llaves de encriptación' }

			const firma = {
				publica: await cripto.exportar.firma.publica(this._llavesFirma.publica),
				privada: await cripto.exportar.firma.privada(this._llavesFirma.privada)
			}

			const encriptacion = {
				publica: await cripto.exportar.encriptacion.publica(this._llavesEncriptacion.publica),
				privada: await cripto.exportar.encriptacion.privada(this._llavesEncriptacion.privada)
			}

			const exportado = { _id: this._id, firma, encriptacion }
			consolo.log(fx, { exportado })
			return exportado
		} catch (e) {
			if (!_.isError(e)) throw e
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}

	async exportarLlaveroPublico(): Promise<LlaveroPublico> {
		const fx = 'LlaveroInterno.exportarLlaveroPublico'
		try {
			if (!this._llavesFirma) throw { error: 'No existen llaves de firma' }
			if (!this._llavesEncriptacion) throw { error: 'No existen llaves de encriptación' }

			const llaves = {
				_id: this._id,
				firma: await cripto.exportar.firma.publica(this._llavesFirma.publica),
				encriptacion: await cripto.exportar.encriptacion.publica(this._llavesEncriptacion.publica)
			}
			return llaves
		} catch (e) {
			if (!_.isError(e)) throw e
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}

	async firmar(cuerpo: JWTPayload) {
		const fx = 'LlaveroInterno.firmar'
		try {
			consolo.log(fx, cuerpo)
			if (!this._llavesFirma) throw { error: 'No existen llaves de firma' }

			const llave = this._llavesFirma.privada
			if (!llave) throw 'Falta llave'

			cuerpo.iss = this._id
			const token = await cripto.firmar(llave, cuerpo, this._id)
			return token
		} catch (e) {
			if (!_.isError(e)) throw e
			consolo.error(fx, e)
			throw { error: `No se pudo ${fx}` }
		}
	}
}
