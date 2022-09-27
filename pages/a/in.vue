<template lang="pug">
.rootIn.flex.ffcn.jcc.aic.minh100vh
	client-only
		div(v-if="$usuario === null") Cargando...
		div(v-else-if="$usuario === false") 
			b No conectado
			SesionEnTarjeta
		NuxtChild(v-else)
	

</template>
<script setup lang="ts">
import { rosetta } from '@/plugins/i18n'
const { $usuario } = useNuxtApp()

const t = rosetta({
	noConectado: {
		es: 'No conectado',
		en: 'Not connected'
	}
})

useHead({
	title: 'In'
})
</script>
<style lang="sass" scoped>
.rootIn
	background-color: #131313
</style>
