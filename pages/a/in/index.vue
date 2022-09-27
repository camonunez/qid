<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh
	pre $usuario {{$usuario}}

	h1 IN!!

</template>
<script setup>
import { rosetta } from '@/plugins/i18n'
const { $usuario } = useNuxtApp()
const t = rosetta({
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
