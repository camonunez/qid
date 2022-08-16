import { defineNuxtConfig } from 'nuxt'
import Components from 'unplugin-vue-components/vite'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineNuxtConfig({
	vite: {
		plugins: [
			Components({
				resolvers: [IconsResolver({ prefix: false, enabledCollections: ['mdi'] })]
			}),
			Icons()
		],
	},

	typescript: {
		typeCheck: true,
		strict: true
	},

	runtimeConfig: {
		// The private keys which are only available within server-side
		// apiSecret: '123',
		// Keys within public, will be also exposed to the client-side
		public: {
			apiURL: '/api',
			dev: process.env.MODO === 'dev'
		}
	},

	css: ['~/sass/base.sass'],

	head: {
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: 'favicon.svg' },
			{ href: '/fonts/stylesheet.css', rel: 'stylesheet', hid: 'dmsans' }
		]
	}
})
