<template lang="pug">
div
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF
	.fz5rem ADSFSDF

	div(ref="arriba")
		.fz5rem.colorPrimario ABAJO
		div visibleArriba : {{ visibleArriba }}
		div visibleAbajo : {{ visibleAbajo }}


	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	.fz5rem UHVASF
	// with options
	div.target(ref='abajo')
		.fz5rem.colorPrimario ABAJO
		div visibleArriba : {{ visibleArriba }}
		div visibleAbajo : {{ visibleAbajo }}


	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD
	.fz5rem LKSJDAASD

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementVisibility } from '@vueuse/core'

const arriba = ref(null)
const abajo = ref(null)

const visibleArriba = useElementVisibility(arriba)

const visibleAbajo = useElementVisibility(abajo)

</script>
<style lang="sass" scoped>
.target
	background-color: red
</style>