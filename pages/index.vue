<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 Hola

		NuxtLink.boton(to="/a") App
		NuxtLink.boton.primario(@click="log('test;')") test
	

</template>
<script setup>
console.log('hello script setup')
// import IconAccountCircle from "~icons/mdi/account-circle";
function log(msg) {
	console.log(msg)
}

definePageMeta({
	title: 'Cuerdos'
})
</script>
