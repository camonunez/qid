<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	h1 IN!!

	NuxtLink(to="/a/in/r") {{t('recuerdos')}}

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
