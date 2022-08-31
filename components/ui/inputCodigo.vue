<template lang="pug">
.uiInput
	label.usn.pb-05rem {{ etiqueta }}
	//- input(:value="modelValue" @input="$emitir('update:modelValue', $event.target.value)" )

	.lineaInput.flex.radio

		.zonaIcono.preIcono.fa00.flex.jcc.aic(v-if="$slots.preIcono")
			slot(name="preIcono")

		input.fa11(v-model="value"
			@keydown="teclarSoloNumeros"
			@paste.prevent="pegarSoloNumeros"
			v-bind="$attrs" 
			vFocus="attrs.enfocar? true : false"
			:class="{ preIcono: $slots.preIcono, postIcono: $slots.postIcono }")

		.zonaIcono.postIcono.fa00.flex.jcc.aic(v-if="$slots.postIcono")
			slot(name="postIcono")

	//@keyup.enter="$emitir('enter', $event.value)"
</template>
<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { z } from 'zod'
const { $consolo } = useNuxtApp()

const props = defineProps({
	etiqueta: { type: String, required: true },
	largo: { type: Number, required: false },
	modelValue: { type: String, required: true },
})
const attrs = useAttrs()
const emitir = defineEmits(['update:modelValue'])


const value = computed({
	get() {
		return props.modelValue
	},
	set(value) {
		emitir('update:modelValue', value)
	}
})

const TeclaDesplazamiento = z.union([
	z.literal('ArrowLeft'), z.literal('ArrowRight'), z.literal('ArrowUp'), z.literal('ArrowDown'),
])
const TeclaCorreccion = z.union([
	z.literal('Backspace'), z.literal('Delete'),
])
const TeclasPermitidas = z.union([ TeclaDesplazamiento, TeclaCorreccion, ])
const TeclaNumerica = z.union([
	z.literal('0'), z.literal('1'), z.literal('2'), z.literal('3'), z.literal('4'), z.literal('5'), z.literal('6'), z.literal('7'), z.literal('8'), z.literal('9'),
])

function teclarSoloNumeros(event: KeyboardEvent) {
	// $consolo.log(`teclarSoloNumeros event`, event)

	const esTeclaPermitida = TeclasPermitidas.safeParse(event.key)
	if (esTeclaPermitida.success) {
		return
	}

	// Ingreso de solo numeros
	const verificacion = TeclaNumerica.safeParse(event.key)
	if (!verificacion.success) {
		event.preventDefault()
		return
	}
	if (value.value.length > 3) {
		event.preventDefault()
		return
	}
}

// function soltarTeclaSoloNumeros(event: KeyboardEvent) {
// 	$consolo.log(`soltarTeclaSoloNumeros event`, event)
// 	// var charCode = (event.charCode) ? event.which : event.keyCode
// 	// if (charCode > 31 && (charCode < 48 || charCode > 57))
// 	// 	return false;
// 	// return true;
// }

function pegarSoloNumeros(event: ClipboardEvent) {
	// $consolo.log(`pegar event`, event)
	const cD = event.clipboardData
	if (!cD) return
	const paste = cD.getData('text');
	$consolo.log(`pegar paste`, paste)

	const codigo = paste.replace(/[^\d]/g, '')
	$consolo.log(`pegar codigo`, codigo)
	value.value = codigo
	return codigo
}

</script>
<style lang="sass" scoped>
@import '@/sass/comun'

.uiInput
	label
		display: block
	input
		display: block
	.lineaInput
		color: $inputColor
		background-color: $inputFondo
		position: relative
		input
			color: inherit
			background-color: transparent
			border: none
			border-radius: inherit
			position: relative
			z-index: 0
			padding: .7rem 1.4rem
			&.preIcono
				padding-left: 3em
			&.postIcono
				padding-right: 3em
		.zonaIcono
			min-width: 2em
			min-height: 2em
			position: absolute
			top: 0
			bottom: 0
			z-index: 1
			// background-color: #ff000022
			&.preIcono
				left: 0
			&.postIcono
				right: 0
</style>