<template lang="pug">
.uiInput
	label.usn.pb-05rem {{ etiqueta }}
	//- input(:value="modelValue" @input="$emitir('update:modelValue', $event.target.value)" )

	.lineaInput.flex.radio

		.zonaIcono.preIcono.fa00.flex.jcc.aic(v-if="$slots.preIcono")
			slot(name="preIcono")

		.inputs.flex.jcc.aic
			input.inputUnDigito(:value="codigo0" 
				@keyup="keyup(0, $event)" @paste="pegarCodigo"
				ref="campoCodigo0"
				type="text" inputmode="numeric" placeholder="*"
				maxlength="1" pattern="\d" min="0" max="9" step="1")

			input.inputUnDigito(:value="codigo1" 
				@keyup="keyup(1, $event)" @paste="pegarCodigo"
				ref="campoCodigo1"
				type="text" inputmode="numeric" placeholder="*"
				maxlength="1" pattern="\d" min="0" max="9" step="1")

			input.inputUnDigito(:value="codigo2" 
				@keyup="keyup(2, $event)" @paste="pegarCodigo"
				ref="campoCodigo2"
				type="text" inputmode="numeric" placeholder="*"
				maxlength="1" pattern="\d" min="0" max="9" step="1")

			input.inputUnDigito(:value="codigo3" 
				@keyup="keyup(3, $event)" @paste="pegarCodigo"
				ref="campoCodigo3"
				type="text" inputmode="numeric" placeholder="*"
				maxlength="1" pattern="\d" min="0" max="9" step="1")

		.zonaIcono.postIcono.fa00.flex.jcc.aic(v-if="$slots.postIcono")
			slot(name="postIcono")

	//@keyup.enter="$emitir('enter', $event.value)"
</template>
<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue'
import { z } from 'zod'
import { useNuxtApp } from 'nuxt/app'
const { $consolo } = useNuxtApp()
// Props
const props = defineProps({
	etiqueta: { type: String, required: true },
	modelValue: { type: String, required: true },
})
// Attributes
// const attrs = useAttrs()
// Eventos
const emitir = defineEmits(['update:modelValue'])

// Refs
const campoCodigo0 = ref<HTMLInputElement | null>(null)
const campoCodigo1 = ref<HTMLInputElement | null>(null)
const campoCodigo2 = ref<HTMLInputElement | null>(null)
const campoCodigo3 = ref<HTMLInputElement | null>(null)
// Data
const codigo0 = ref<string>()
const codigo1 = ref<string>()
const codigo2 = ref<string>()
const codigo3 = ref<string>()


const CodigoTupla = z.tuple([
	z.number().min(0).max(9),
	z.number().min(0).max(9),
	z.number().min(0).max(9),
	z.number().min(0).max(9),
])
type CodigoTupla = z.infer<typeof CodigoTupla>
const EncadenadorDeCodigo = CodigoTupla.transform(val => val.join(''))

// Methods
function keyup(index: number, event: KeyboardEvent) {
	$consolo.log(`keyup ${index}, event`, event)

	const tecla = event.key
	const numeros = z.union([
		z.literal('0'),
		z.literal('1'),
		z.literal('2'),
		z.literal('3'),
		z.literal('4'),
		z.literal('5'),
		z.literal('6'),
		z.literal('7'),
		z.literal('8'),
		z.literal('9'),
	])

	const calzarNumero = numeros.safeParse(tecla)
	const esNumero = calzarNumero.success
	const calzarBorrar = z.literal('Backspace').safeParse(tecla)
	const esBorrar = calzarBorrar.success

	if (esNumero) {
		const numero = calzarNumero.data
		switch (index) {
			case 0:
				codigo0.value = numero
				campoCodigo1.value && campoCodigo1.value.focus()
				break
			case 1:
				codigo1.value = numero
				campoCodigo2.value && campoCodigo2.value.focus()
				break
			case 2:
				codigo2.value = numero
				campoCodigo3.value && campoCodigo3.value.focus()
				break
			case 3:
				codigo3.value = numero
				break
		}
	} else if (esBorrar) {
		switch (index) {
			case 0:
				codigo0.value = ''
				break
			case 1:
				codigo1.value = ''
				campoCodigo0.value && campoCodigo0.value.focus()
				break
			case 2:
				codigo2.value = ''
				campoCodigo1.value && campoCodigo1.value.focus()
				break
			case 3:
				codigo3.value = ''
				campoCodigo2.value && campoCodigo2.value.focus()
				break
		}
	}

	// const value = esNumero ? '' : input.value

	// $consolo.log(`cambio ${index} ${value}`)

}

function pegarCodigo (event: ClipboardEvent) {
	$consolo.log(`pegarCodigo event`, event)
	const clipboardData = event.clipboardData
	if (!clipboardData) {
		return
	}
	const text = clipboardData.getData('text')
	$consolo.log(`pegarCodigo text`, text)
	const codigo = EncadenadorDeCodigo.safeParse(text)
	$consolo.log(`pegarCodigo codigo`, codigo)
	if (codigo.success) {
		const tupla = codigo.data
		codigo0.value = tupla[0]
		codigo1.value = tupla[1]
		codigo2.value = tupla[2]
		codigo3.value = tupla[3]
	}
}
function cambio(index: number, event: Event) {
	$consolo.log(`cambio ${index}, event`, event)

	const input = event.target as HTMLInputElement
	const value = isNaN(Number(input.value)) ? '' : input.value

	$consolo.log(`cambio ${index} ${value}`)


	switch (index) {
		case 0:
			codigo0.value = value
			campoCodigo1.value && campoCodigo1.value.focus()
			break
		case 1:
			codigo1.value = value
			campoCodigo2.value && campoCodigo2.value.focus()
			break
		case 2:
			codigo2.value = value
			campoCodigo3.value && campoCodigo3.value.focus()
			break
		case 3:
			codigo3.value = value
			break
	}

	// nextTick(() => {
	// 	// window.requestAnimationFrame(cronometrar)
	// })
	// }
	// const codigo = EncadenadorDeCodigo([codigo0.value, codigo1.value, codigo2.value, codigo3.value])
	// emitir('update:modelValue', codigo)
}

// Watchers
// watch([codigo0, codigo1, codigo2, codigo3], ([dCod0, dCod1, dCod2, dCod3]) => {
// 	$consolo.log({
// 		dCod0,
// 		dCod1,
// 		dCod2,
// 		dCod3
// 	})
// 	const r = EncadenadorDeCodigo.safeParse([dCod0, dCod1, dCod2, dCod3])
// 	if (!r.success) {
// 		console.log('error', r.error)
// 		return
// 	}
// 	const codigo = r.data
// 	emitir('update:modelValue', codigo)
// 	// value.set(codigo)
// })

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

		.inputs
			border: 1px solid red
			&.preIcono
				padding-left: 3em
			&.postIcono
				padding-right: 3em
			.inputUnDigito
				border: 1px solid teal
				width: 6em
				height: 3em
				padding: .2rem
				text-align: center
			input
				color: inherit
				background-color: transparent
				border: none
				border-radius: inherit
				position: relative
				z-index: 0
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