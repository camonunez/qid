<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	h1 IN!!

</template>
<script setup>
const { $usuario, $rosetta } = useNuxtApp()
const t = $rosetta({
	recuerdos: {
		es: 'Recuerdos',
		en: 'Memories'
	}
})

function log(msg) { console.log(msg) }

useHead({
	title: 'App'
})
</script>
