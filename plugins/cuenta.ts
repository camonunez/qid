import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { ref, reactive, readonly, computed } from 'vue'
import localforage from 'localforage'
import jwtDecode from 'jwt-decode'
import _ from 'lodash'
import { z } from 'zod'

import dayjs from '@/lib/fecha'
import { validadorEmail, validadorPass, validadorToken } from '@/lib/validadores'
import { obtenerLlaveroPropio } from '@/lib/miLlavero'
import { LlaveroExterno } from '@/lib/llavero'
import crearClienteHTTP from '@/lib/clienteHTTP'

import { TokenBody, Sesion } from './cuentas/types'
import type { CredencialSesion } from './cuentas/types'

declare global {
	interface Window { 
		obtenerLlaveroAPI: typeof obtenerLlaveroAPI;
		cuentaAPI: typeof cuentaAPI;
	 }
}

const usuarioSchema = z.object({
	_id: z.string(),
	email: validadorEmail,
	nombre: z.string(),
	apellido: z.string(),
})

// 

const tokenReactivo = ref({
	token: null,
	decodificado: null,
	expConfianza: null
} as CredencialSesion)

export const elToken = computed<string | null>({
	get: () => tokenReactivo.value.token,
	set: tkn => {
		if (!tkn) {
			tokenReactivo.value = {
				token: null,
				decodificado: null,
				expConfianza: null
			}
			return
		}
		const decodificado = tkn ? jwtDecode<TokenBody>(tkn) : null
		tokenReactivo.value = {
			token: tkn,
			decodificado: decodificado,
			expConfianza: decodificado ? (decodificado.iat || dayjs().unix()) + 60 * minutosDeConfianza : null
		}
	}
})

const sesion = reactive({
	usuario: null,
	sinConexion: false
} as Sesion)

// *---------*
//  CuentaAPI
// *---------*

let llaveroAPICache: LlaveroExterno | null = null

async function obtenerLlaveroAPI () {
	const fx = 'obtenerLlaveroAPI'
	if (llaveroAPICache) return llaveroAPICache
	
	const r = await clienteAPI({
		url: `/llavero`,
		method: 'get',
	})

	console.log(fx, r)

	const llaveroAPISchema = z.object({
		_id: z.string(),
		firma: z.string(),
		encriptacion: z.string()
	})

	const { _id, firma, encriptacion } = llaveroAPISchema.parse(r)

	llaveroAPICache = await LlaveroExterno.instanciar({ _id, firma, encriptacion })
	return llaveroAPICache
}

const config = reactive<{
	cuentaAPIURL: string | null
	dev: boolean | null
}>({
	cuentaAPIURL: null,
	dev: null
})

const cuentaStore = localforage.createInstance({ name: 'CuentaStore' })
const minutosDeConfianza = config.dev ? 7 * 24 * 60 : 5

const testToken = z.string()

export const usuario = computed(() => sesion.usuario)

const clienteAPI = crearClienteHTTP()

clienteAPI.on('http:hayRespuesta', () => {
	console.warn('clienteAPI', 'http:hayRespuesta')
	if (sesion.sinConexion) sesion.sinConexion = false
})
clienteAPI.on('http:sinRespuesta', () => {
	console.warn('clienteAPI', 'http:sinRespuesta')
	cuentaAPI.ping()
})
clienteAPI.on('desconectado', () => {
	console.warn('clienteAPI', 'desconectado')
	cuentaAPI.salir()
})

const cuentaAPI = {
	async init(config: {
		baseURL: string
		dev: boolean
	}) {
		const fx = 'cuenta>init'
		try {
			clienteAPI.init(config.baseURL)
			const token = await cuentaStore.getItem('token')
			if (typeof token === 'string') cuentaAPI.ingresarConToken(token)
			else cuentaAPI.salir()
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},
	async ping() {
		const fx = 'cuenta>ping'
		try {
			console.log(`%c${fx}`, 'color: #44ccff')
			const r = await clienteAPI(
				{
					url: `/ping`,
					method: 'get'
				},
				() => {
					sesion.sinConexion = true
				}
			)
			sesion.sinConexion = r && r.ok ? false : true
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async leer(t = elToken.value) {
		const fx = 'cuenta>leer'
		try {
			console.log(`%c${fx}`, 'color: #44CCFF')
			const tkn = testToken.parse(t)
			const r = await clienteAPI({
				url: ``,
				method: 'get',
				headers: { Authorization: `Bearer ${tkn}` }
			})
			console.log(`${fx} r`, r)

			const respuestaSchema = z.object({
				token: validadorToken,
				encriptado: z.string()
			})
			const { encriptado } = respuestaSchema.parse(r)
			
			const llaveroCliente = await obtenerLlaveroPropio()
			const decriptado = await llaveroCliente.decriptar(encriptado)
			console.log(`${fx} decriptado`, decriptado)
			const usuario = usuarioSchema.parse(decriptado)
			sesion.usuario = usuario
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async ingresarConToken(token: string) {
		const fx = 'cuenta>ingresarConToken'
		const tkn = testToken.parse(token)
		try {
			console.log(`%c${fx}`, 'color: #44ccff')
			elToken.value = tkn
			return await this.leer(tkn)
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async ingresar(email: string, password: string) {
		const fx = 'cuenta>ingresar'
		try {
			const ingresoSchema = z.object({
				password: validadorPass,
				email: validadorEmail
			})
			const datos = ingresoSchema.parse({ email, password })
			console.log(fx, { email, password })

			const llaveroCliente = await obtenerLlaveroPropio()
			const llaveroPublicoCliente = await llaveroCliente.exportarLlaveroPublico()

			const llaveroAPI = await obtenerLlaveroAPI()
			const emailYPass = await llaveroAPI.encriptar(datos)

			const r = await clienteAPI({
				url: `/ingresar`,
				data: { encriptado: emailYPass, llaveroPublicoCliente },
				method: 'post'
			})

			const respuestaSchema = z.object({
				token: validadorToken,
				encriptado: z.string()
			})
			const { token, encriptado } = respuestaSchema.parse(r)
			const decriptado = await llaveroCliente.decriptar(encriptado)
			console.log(`${fx} token`, token)
			console.log(`${fx} decriptado`, decriptado)
			const usuario = usuarioSchema.parse(decriptado)
			sesion.usuario = usuario
			elToken.value = token
			return {
				usuario,
				token
			}
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async salir() {
		const fx = 'cuenta>salir'
		try {
			console.log(`%c${fx}`, 'color: #44ccff')
			sesion.usuario = false
			elToken.value = null

			await cuentaStore.clear()
			return true
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async registrar(nombre: string, apellido: string, email: string, password: string) {
		const fx = 'cuenta>registrar'
		try {
			console.log(fx, { nombre, apellido, email, password })
			const registroSchema = z.object({
				nombre: z.string(),
				apellido: z.string(),
				password: validadorPass,
				email: validadorEmail
			})

			const datos = registroSchema.parse({ nombre, apellido, email, password })
			const llaveroAPI = await obtenerLlaveroAPI()
			const registroEncriptado = await llaveroAPI.encriptar(datos)

			const llaveroCliente = await obtenerLlaveroPropio()
			const llaveroPublicoCliente = await llaveroCliente.exportarLlaveroPublico()

			const r = await clienteAPI({
				url: `/registrar`,
				data: { encriptado: registroEncriptado, llaveroPublicoCliente },
				method: 'post'
			})
			console.log(`${fx} r`, r)

			const respuestaSchema = z.object({
				token: validadorToken,
				encriptado: z.string()
			})
			const { token, encriptado } = respuestaSchema.parse(r)
			const decriptado = await llaveroCliente.decriptar(encriptado)
			console.log(`${fx} token`, token)
			console.log(`${fx} decriptado`, decriptado)
			const usuario = usuarioSchema.parse(decriptado)
			sesion.usuario = usuario
			elToken.value = token
			return {
				usuario,
				token
			}

		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	cambiarPass: {
		async pedirCodigo(email: string, passNuevo: string) {
			const fx = 'cuenta>cambiarPass>pedirCodigo'
			try {
				z.string().parse(email)
				z.string().parse(passNuevo)

				console.log(`%c${fx}`, 'color: #44ccff')
				const r = await clienteAPI({
					url: `/cambiarPass/pedirCodigo`,
					method: 'post',
					data: { email, passNuevo }
				})
				console.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(`${fx} error`, e)
			}
		},
		async conCodigo(email: string, codigo: string) {
			const fx = 'cuenta>cambiarPass>conCodigo'
			try {
				console.log(`%c${fx}`, 'color: #44ccff')
				const r = await clienteAPI({
					url: `/cambiarPass/conCodigo`,
					method: 'post',
					data: { email, codigo }
				})
				console.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(`${fx} error`, e)
			}
		}
	},

	async obtenerCargaFirmadaAvatar() {
		const fx = 'cuenta>obtenerCargaFirmadaAvatar'
		try {
			console.log(`%c${fx}`, 'color: #44ccff')
			if (!elToken.value) throw 'Usuario no conectado'
			const r = await clienteAPI({
				url: `/avatar/putUrl`,
				method: 'get',
				headers: { Authorization: `Bearer ${elToken.value}` }
			})
			console.log(`${fx} r`, r)
			return r.url
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async guardarUrlAvatar(url: string) {
		const fx = 'cuenta>guardarUrlAvatar'
		try {
			console.log(fx, url)
			if (!elToken.value) throw 'Usuario no conectado'
			if (!url) throw 'falta url del avatar'
			const r = await clienteAPI({
				url: `/avatar/url`,
				method: 'post',
				data: { url },
				headers: { Authorization: `Bearer ${elToken.value}` }
			})
			console.log(`${fx} r`, r)

			sesion.usuario = r.usuario || false
			return r
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	}
}


export default defineNuxtPlugin(nuxtApp => {
	try {
		const c = useRuntimeConfig()

		if (!c.cuentaAPIURL) throw new Error('No se ha definido la URL de la API de cuentas')

		nuxtApp.hook('app:mounted', () => {
			// console.log('app:mounted')
			// Llavero.init()
			cuentaAPI.init({
				baseURL: c.public.cuentaAPIURL,
				dev: c.public.dev
			})

			window.obtenerLlaveroAPI = obtenerLlaveroAPI
			window.cuentaAPI = cuentaAPI
		})
		return {
			provide: {
				cuentaAPI: readonly(cuentaAPI),
				usuario
			}
		}
	} catch (e) {
		console.error('cuentaAPI', e)
	}
})
