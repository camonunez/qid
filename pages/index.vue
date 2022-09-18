<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 Hola

		NuxtLink.boton(to="/a") App
	

</template>
<script setup>
console.log('hello script setup')
function log(msg) {
	console.log(msg)
}

definePageMeta({
	title: 'Cuerdos'
})
</script>
