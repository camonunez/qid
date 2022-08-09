<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 IN!
		p {{ $usuario }}
		.boton.primario(@click="$usuario.nombre = 'Pepe'") Cambiar nombre readonly
		.boton.primario(@click="$usuarioEditable.nombre = 'Pepe'") Cambiar nombre editable
	

</template>
<script setup>
console.log('hello script setup')
// import IconAccountCircle from "~icons/mdi/account-circle";
function log() {
	console.log(msg)
}
const { $usuario, $usuarioEditable } = useNuxtApp()
definePageMeta({
	title: 'Cuerdos'
})
</script>
