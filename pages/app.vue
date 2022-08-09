<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 ## APP

		div usuario
		div {{$usuario}}

		NuxtChild
	

</template>
<script setup>
console.log('hello script setup')
// import IconAccountCircle from "~icons/mdi/account-circle";
function log(msg) {
	console.log(msg)
}
const { $usuario } = useNuxtApp()

useHead({
	title: 'Cuerdos'
})
</script>
