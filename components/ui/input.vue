<template lang="pug">
.uiInput
	label.usn.pb-05rem(v-if="!etiqueta") {{ etiqueta }}
	.zonaEtiqueta.usn.pb-05rem(v-else-if="slots.etiqueta")
		slot(name="etiqueta")
	//- input(:value="modelValue" @input="$emitir('update:modelValue', $event.target.value)" )

	.lineaInput.flex.radio

		.zonaIcono.preIcono.fa00.flex.jcc.aic(v-if="$slots.preIcono")
			slot(name="preIcono")

		input.fa11(v-model="value" v-bind="$attrs" 
			vFocus="attrs.enfocar? true : false"
			:class="{ preIcono: $slots.preIcono, postIcono: $slots.postIcono }")

		.zonaIcono.postIcono.fa00.flex.jcc.aic(v-if="$slots.postIcono")
			slot(name="postIcono")
	
	//@keyup.enter="$emitir('enter', $event.value)"
</template>
<script setup lang="ts">
const props = defineProps<{
  etiqueta?: string,
  modelValue: string,
}>()
const slots = useSlots()
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
				padding-left: 2em
			&.postIcono
				padding-right: 2em
		.zonaIcono
			min-width: 2em
			min-height: 2em
			position: absolute
			top: 0
			bottom: 0
			z-index: 1
			&.preIcono
				left: 0
			&.postIcono
				right: 0

			:deep(.clickable)
				cursor: pointer
				display: flex
				justify-content: center
				align-items: center
				color: $primario
				
</style>