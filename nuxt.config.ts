import { defineNuxtConfig } from 'nuxt'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'


const dev = process.env.MODO === 'dev'

export default defineNuxtConfig({
	vite: {
		plugins: [
			Components({
				resolvers: [IconsResolver()]
			}),
			Icons()
		],
		server: {
			hmr: {
				host: 'localhost'
			}
		}
	},

	typescript: {
		typeCheck: true,
		strict: true,
		tsConfig: {
			compilerOptions: {
				esModuleInterop: true,
				allowSyntheticDefaultImports: true
			},
			exclude: ['../dist', '../components.d.ts', '../node_modules']
		}
	},

	runtimeConfig: {
		// The private keys which are only available within server-side
		// apiSecret: '123',
		// Keys within public, will be also exposed to the client-side
		public: {
			apiURL: dev ? 'https://api.pow.test' : 'https://api.qid.cl',
			dev
		}
	},

	css: ['~/sass/base.sass'],

	head: {
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: 'favicon.svg' },
		]
	},
})
