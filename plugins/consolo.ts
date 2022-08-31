
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin((/* nuxtApp */) => {
	try {
		const consolo = useConsolo()
		// const consolo = configuracion.public.dev ? console : consoloff
		return {
			provide: {
				consolo
			}
		}
	} catch (e) {
		console.error('Consolo', e)
	}
})
