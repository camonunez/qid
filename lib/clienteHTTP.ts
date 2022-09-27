
import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import _ from 'lodash'

import crearEmisorEventos from '@/lib/emisorEventos'

// ClienteHTTP

const generarCliente = (baseURL?: string) => {
	const config = {
		inicializado: false,
		baseURL
	}
	if (baseURL) config.baseURL = baseURL

	const clienteHTTP = async (request: AxiosRequestConfig, errorHandler?: null | any): Promise<any> =>{
		if (!config.inicializado) throw 'clienteHTTP: no inicializado'
		if (!config.baseURL) throw 'clienteHTTP: baseURL no está definido'

		const ops = _.assignIn(
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				}
			},
			request
		)
		const url = `${config.baseURL}${ops.url}`
		ops.url = url
	
		const r = await axios(ops)
			.then(async r => {
				// Hubo respuesta, si estaba sinConexion, corregir
				clienteHTTP.emit('http:hayRespuesta')
	
				if (r.data.desconectado) clienteHTTP.emit('desconectado')
				return r.data
			})
			.catch(function (error: AxiosError) {
				if (error.response) {
					const { status, data } = error.response
					console.log('Status fuera del rango 2XX', { status, data })
					if (errorHandler) errorHandler(error)
				} else if (error.request) {
					console.log('Sin respuesta (capturadorErrorSolicitud)')
					clienteHTTP.emit('http:sinRespuesta')
				} else {
					console.log('Error inesperado (capturadorErrorSolicitud)', error.message)
				}
				console.log(error.config)
			})
		return r
	}
	const emisorEventos = crearEmisorEventos()
	
	clienteHTTP.on = emisorEventos.on
	clienteHTTP.emit = emisorEventos.emit
	clienteHTTP.off = emisorEventos.off

	clienteHTTP.init = (baseURL: string) => {
		config.baseURL = baseURL
		config.inicializado = true
	}

	return clienteHTTP
}

export default generarCliente

// const loguear = true



// export const consolo = ()