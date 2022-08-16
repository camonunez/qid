<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	.anchoComun
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

	NuxtChild

</template>
<script setup>
const { $usuario } = useNuxtApp()

function log(msg) { console.log(msg) }

useHead({
	title: 'App'
})
</script>
