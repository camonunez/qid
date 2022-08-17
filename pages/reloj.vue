<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh
	b Reloj
	NuxtChild

</template>
<script setup>
const { $usuario } = useNuxtApp()

function log(msg) { console.log(msg) }

useHead({
	title: 'Reloj'
})
</script>
