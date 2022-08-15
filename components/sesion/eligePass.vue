<template lang="pug">
.autovalidadorDatosPersonales.anchoMovil
	.cabecera
		b Antes de comenzar, por favor
		h1 Elige tu contraseña
	.formulario
		SesionCreacionPass(v-if="email" :email="email")
</template>
<script>
export default {
	computed: {
		email() {
			return this.$usuario.email
		}
	},
	mounted() {
		// if (this.$cuenta.datosPrivados) this.decriptarDatosPersonales()
		// else this.datosCargados = true
	},
	methods: {
		// async decriptarDatosPersonales () {
		// 	const datosPersonales = await this.$cuenta.decriptarDatosPersonales()
		// 	const { email } = datosPersonales
		// 	this.email = email
		// }
	}
}
</script>
<style lang="sass" scoped>
.cabecera
	padding-top: 4em
	h1
		margin: 0 0 1rem
.autovalidadorDatosPersonales
	h1
		margin: 0 0 1rem
</style>
