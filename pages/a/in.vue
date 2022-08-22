<template lang="pug">
.rootIn.flex.jcc.aic.minh100vh

	div(v-if="$usuario === [2]") Cargando...
	div(v-if="$usuario === null") Cargando...
	div(v-else-if="$usuario === false") 
		b No conectado
		SesionIngreso
	NuxtChild(v-else)
	

</template>
<script setup lang="ts">
import { useNuxtApp, useHead } from 'nuxt/app'
import { z } from 'zod'

const { $usuario, $rosetta } = useNuxtApp()

if (typeof window !== 'undefined') {
	// @ts-ignore
	window.z = z
}

const traductor = $rosetta({
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
	background-color: #333
</style>
