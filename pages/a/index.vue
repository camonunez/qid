<template lang="pug">
//- .flex.jcc.aic.minh100vh
div
	.h100vh.fondoMedioOscuro.flex.jcc.aic.p2rem

		div
			h1 {{ t('estoEsUnLanding') }}
			//- h2 {{ t('holaNombre', {nombre: 'Paco'}) }}
			//- h2 {{ holaNombre }}
			NuxtLink(to='/a/in') Entrar


	.h100vh.fondoMedio


	.h100vh.fondoMedioClaro



</template>
<script setup lang="ts">
import { rosetta } from '@/plugins/i18n'

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
