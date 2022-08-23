<template lang="pug">
.rootUsuarioConectado
	transition(mode="out-in" :duration="300")

		form.formulario(
			layout="vertical")

			h1.titulo {{ i18n('hola') }}

			.contenido
				.formElemento
					.avatarImagen.con(v-if="$usuario.avatar")
						.img(:style="`background-image: url(${$usuario.avatar})`")
					.avatarImagen.sin(v-else)
						.inicial {{$usuario.nombre[0]}}
				.formElemento
					.texto {{$usuario.nombre}} {{$usuario.apellido}}
					.texto {{$usuario.email}}
				.formElemento
					a(@click="$cuenta.salir") {{i18n('cerrarSesion')}}

</template>
<script setup lang="ts">
import { useNuxtApp } from 'nuxt/app'
import { ref, reactive, computed, watch } from 'vue'

import { rosetta } from '@/plugins/i18n'
import { z } from 'zod'

// Plugins
const { $usuario, $cuenta } = useNuxtApp()
// i18n
const i18n = rosetta({
	hola: {
		es: 'Hola',
		en: 'Hello'
	},
	cerrarSesion: {
		es: 'Cerrar sesión',
		en: 'Sign out'
	}
})

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
