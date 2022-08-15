<template lang="pug">
.rootUsuarioConectado
	transition(mode="out-in" :duration="300")

		a-form-model.formulario(
			layout="vertical")

			h1.titulo {{ $t('hola') }}

			.contenido
				a-form-model-item
					.avatarImagen.con(v-if="$usuario.avatar")
						.img(:style="`background-image: url(${$usuario.avatar})`")
					.avatarImagen.sin(v-else)
						.inicial {{$usuario.nombre[0]}}
				a-form-model-item
					.texto {{$usuario.nombre}} {{$usuario.apellido}}
					.texto {{$usuario.email}}
				a-form-model-item
					a(@click="$cuenta.salir") {{$t('cerrarSesion')}}

</template>
<script>
export default {
	name: 'UsuarioConectado',
	methods: {},
	traducciones: {
		hola: { es: 'Hola!' },
		cerrarSesion: { es: 'Cerrar sesión' }
	}
}
</script>
<style lang="sass" scoped>
@import "~/sass/comun"

.rootUsuarioConectado
	width: 100%

	$lado: 6em
	.contenido
		text-align: center
		.avatarImagen
			margin: 0 auto
			width: $lado
			height: $lado
		.avatarImagen
			border-radius: 10em
			background-color: hsla(0,0%,100%,.05)
			border: .2em solid hsla(0,0%,100%,.075)
			display: flex
			justify-content: center
			align-items: center
			.img
				+bgcov
				width: 100%
				height: 100%
				border-radius: 10em
</style>
