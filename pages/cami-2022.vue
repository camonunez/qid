<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 Feliz cumple Camiiiii!!!
		.fz3rem.mt5rem AAAAAAAaAAAAAa!!!!!!
		.tac Aun no lo veai po
		//- NuxtLink.boton.primario(@click="log('test;')") test
	

</template>
<script setup>
console.log('hello script setup')
// import IconAccountCircle from "~icons/mdi/account-circle";
function log(msg) {
	console.log(msg)
}

definePageMeta({
	title: 'Feliz cumple Camiiiii!!!',
})
</script>
