import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'

import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { ref, reactive, readonly, computed } from 'vue'
import localforage from 'localforage'
import jwtDecode from 'jwt-decode'
import _ from 'lodash'
import { z } from 'zod'

import dayjs from '@/lib/fechas'

import { TokenBody, Sesion } from './cuentas/types'
import type { CredencialSesion } from './cuentas/types'

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

// ClienteHTTP
async function clienteHTTP(request: AxiosRequestConfig, errorHandler?: null | any): Promise<any> {
	const ops = _.assignIn(
		{
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		},
		request
	)

	const r = await axios(ops)
		.then(async r => {
			// Hubo respuesta, si estaba sinConexion, corregir
			if (sesion.sinConexion) sesion.sinConexion = false

			if (r.data.desconectado) {
				cuentaAPI.salir()
				sesion.usuario = null
				elToken.value = null
				await cuentaStore.clear()
			}

			return r.data
		})
		.catch(errorHandler || capturadorErrorSolicitud)
	return r
}

function capturadorErrorSolicitud(error: AxiosError) {
	if (error.response) {
		const { status, data } = error.response
		console.log('Status fuera del rango 2XX', { status, data })
	} else if (error.request) {
		console.log('Sin respuesta (capturadorErrorSolicitud)')
		// console.log(error.request)
		cuentaAPI.ping()
	} else {
		console.log('Error inesperado (capturadorErrorSolicitud)', error.message)
	}
	console.log(error.config)
}

// *---------*
//  CuentaAPI
// *---------*

const config = reactive({
	apiURL: null,
	dev: null
})

const apiURL = `${config.apiURL}/cuentas`
const cuentaStore = localforage.createInstance({ name: 'CuentaStore' })
const minutosDeConfianza = config.dev ? 7 * 24 * 60 : 5

const testToken = z.string()

const cuentaAPI = {
	async init() {
		const fx = 'cuenta>init'
		try {
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
			const r = await clienteHTTP(
				{
					url: `${config.apiURL}/ping`,
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

	async leer(t = elToken) {
		const fx = 'cuenta>leer'
		try {
			console.log(`%c${fx}`, 'color: #44CCFF')

			const tkn = testToken.parse(t)

			const r = await clienteHTTP({
				url: `${config.apiURL}`,
				method: 'get',
				headers: { Authorization: `Bearer ${tkn}` }
			})

			console.log(`${fx} r`, r)

			sesion.usuario = r.usuario
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async ingresarConToken(token: string) {
		const fx = 'cuenta>ingresarConToken'
		const tkn = testToken.parse(token)
		try {
			console.log(`%c${fx}`, 'color: #44ccff')
			const r = await clienteHTTP({
				url: `${config.apiURL}`,
				method: 'get',
				headers: { Authorization: `Bearer ${tkn}` }
			})

			console.log(`${fx} r`, r)

			sesion.usuario = r.usuario
			elToken.value = tkn
		} catch (e) {
			console.error(`${fx} error`, e)
		}
	},

	async ingresar(email: string, password: string) {
		const fx = 'cuenta>ingresar'
		try {
			console.log(fx, { email, password })
			const r = await clienteHTTP({
				url: `${config.apiURL}/ingresar`,
				data: { email, password },
				method: 'post'
			})
			console.log(`${fx} r`, r)
			if (r.ok) {
				sesion.usuario = r.usuario
				elToken.value = r.token
			}
			return r
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

	async crearCuenta(nombre: string, apellido: string, email: string, password: string) {
		const fx = 'cuenta>crearCuenta'
		try {
			console.log(fx, { nombre, apellido, email, password })
			const r = await clienteHTTP({
				url: `${config.apiURL}/crear`,
				data: { nombre, apellido, email, password },
				method: 'post'
			})
			console.log(`${fx} r`, r)

			sesion.usuario = r.usuario || false
			elToken.value = r.token || null
			if (r.token) await cuentaAPI.leer()

			return r
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
				const r = await clienteHTTP({
					url: `${config.apiURL}/cambiarPass/pedirCodigo`,
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
				const r = await clienteHTTP({
					url: `${config.apiURL}/cambiarPass/conCodigo`,
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
			const r = await clienteHTTP({
				url: `${config.apiURL}/avatar/putUrl`,
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
			const r = await clienteHTTP({
				url: `${config.apiURL}/avatar/url`,
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

export const usuario = computed(() => sesion.usuario)

export default defineNuxtPlugin(nuxtApp => {
	try {
		const configuracion = useRuntimeConfig()
		config.apiURL = configuracion.public.apiURL
		config.dev = configuracion.public.dev

		// console.log('nuxtApp.vueApp', nuxtApp.vueApp)
		nuxtApp.hook('app:mounted', () => {
			// console.log('app:mounted')
			cuentaAPI.init()
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
