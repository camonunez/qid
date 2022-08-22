
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

const consoloff = {
	log: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
	time: () => {},
	timeEnd: () => {}
}



export default defineNuxtPlugin((/* nuxtApp */) => {
	try {

		const configuracion = useRuntimeConfig()
		
		const consolo = configuracion.public.dev ? console : consoloff

		return {
			provide: {
				consolo
			}
		}
	} catch (e) {
		console.error('Consolo', e)
	}
})
