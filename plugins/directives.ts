import { defineNuxtPlugin } from 'nuxt/app'


export default defineNuxtPlugin(nuxtApp => {
	nuxtApp.vueApp.directive('vFocus', {
		mounted(el) {
			el.focus()
		}
	})
})
