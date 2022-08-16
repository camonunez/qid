<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	//- .anchoComun
		div(v-if="$usuario === null") Cargando...
		div(v-else-if="$usuario === false") 
			.boton(@click="") Conectar
		div.flex.aic.jcfs(v-else) 
			// Avatar
			.br10em.flec.jcc.aic
				.tac {{$usuario.nombre[0]}}
			// Datos usuario
			.ml1rem
				div {{$usuario.nombre}}
	//- h1 Esto es un landing
	h1 {{ t('estoEsUnLanding') }}
	h2 {{ t('holaNombre', {nombre: 'Paco'}) }}
	h2 {{ holaNombre }}
	NuxtLink(to='/a/in') Entrar

</template>
<script setup lang="ts">
// import { useNuxtApp, useHead } from 'nuxt/app'
import { rosetta } from '@/plugins/i18n'
// const { $usuario, $rosetta } = useNuxtApp()

// function log(msg: string) { console.log(msg) }

// useHead({
// 	title: 'App'
// })

const t = rosetta({
	estoEsUnLanding: {
		es: 'Esto es un landing',
		en: 'This is a landing'
	},
	holaNombre: {
		es: 'Hola {{nombre}}',
		en: 'Hello {{nombre}}'
	}
} as const)

const holaNombre = t('holaNombre', { nombre: 'Pepo' })
</script>
