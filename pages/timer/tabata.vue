<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	.my2rem
		NuxtLink(to="/timer") Cronometro

	div
		h2 Configuracion

		//- i-arcticons-tenbitclockwidget.fz3rem(style="font-size: 3em; color: red")
		//- i-carbon-4k
		//- i-mdi-account-box(style="font-size: 2em; color: red")
		//- i-system-uicons-bookmark(style="font-size: 2em; color: red")
		//- b pre {{pre}}
		//- .flex
			button(@click="alterarPre(-10)") &lt;&lt;
			button(@click="alterarPre(-1)") &lt;
			button(@click="alterarPre(1)") &gt;
			button(@click="alterarPre(10)") &gt;&gt;
		div.usn

			.bloquePrevio.p-05rem.radio.mt1rem
				// Linea preparación
				.lineaPreparacion.radio.flex.jcsb.aic.px1rem.py1rem

					.fz2rem.flex.aic
						i-pixelarticons-flag.mr1rem
						| Preparación

					// Tiempo de preparación
					.flex.aic.radio
						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarPre(-1)") 
							i-akar-icons-circle-minus-fill

						.valor.px1rem.radio.tac
							.fwb.fz-15rem {{$dayjs.duration(pre, 'seconds').format('mm:ss')}}

						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarPre(1)")
							i-akar-icons-circle-plus-fill

			.bloqueRondas.p-05rem.radio.mt1rem


				.lineaAccion.radio.flex.jcsb.aic.px1rem.py1rem.mb1rem

					.fz2rem.flex.aic
						i-pixelarticons-play.mr1rem
						| Accion
					.flex.aic.radio
						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarAccion(-1)") 
							i-akar-icons-circle-minus-fill

						.valor.px1rem.radio.tac
							.fwb.fz-15rem {{$dayjs.duration(accion, 'seconds').format('mm:ss')}}

						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarAccion(1)")
							i-akar-icons-circle-plus-fill


				.lineaDescanso.radio.flex.jcsb.aic.px1rem.py1rem.mb1rem

					.fz2rem.flex.aic
						i-pixelarticons-pause.mr1rem
						| Descanso
					.flex.aic.radio
						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarDescanso(-1)") 
							i-akar-icons-circle-minus-fill

						.valor.px1rem.radio.tac
							.fwb.fz-15rem {{$dayjs.duration(descanso, 'seconds').format('mm:ss')}}

						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarDescanso(1)")
							i-akar-icons-circle-plus-fill



				.lineaRondas.radio.flex.jcsb.aic.px1rem.py1rem

					.fz2rem.flex.aic
						i-pixelarticons-repeat.mr1rem
						| Rondas
					.flex.aic.radio
						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarRondas(-1)") 
							i-akar-icons-circle-minus-fill

						.valor.px1rem.radio.tac
							.fwb.fz-15rem {{rondas}}

						.icoBoton.fz2rem.lh1(:class="alterable ? 'cursorPointer' : 'cursorNotAllowed'" @click="alterarRondas(1)")
							i-akar-icons-circle-plus-fill


			// Zona total
			.p-05rem.radio.mt1rem

				.radio.flex.jcsb.aic.px1rem.py1rem

					.fz2rem.flex.aic
						i-pixelarticons-hourglass.mr1rem
						| Tiempo total
					.flex.aic.radio

						.valor.px1rem.radio.tac
							.fwb.fz-15rem {{$dayjs.duration(pre + ((accion + descanso) * rondas), 'seconds').format('mm:ss')}}



</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, useNuxtApp } from 'nuxt/app'

const { $dayjs } = useNuxtApp()

const route = useRoute()
const router = useRouter()

const pre = ref<number>(route.query.pre ? Number(route.query.pre) : 10)
const accion = ref<number>(route.query.accion ? Number(route.query.accion) : 20)
const descanso = ref<number>(route.query.descanso ? Number(route.query.descanso) : 10)
const rondas = ref<number>(route.query.rondas ? Number(route.query.rondas) : 8)

watch([pre, accion, descanso, rondas], ([dPre, dAccion, dDescanso, dRondas]) => {
	router.push({
		query: {
			pre: dPre,
			accion: dAccion,
			descanso: dDescanso,
			rondas: dRondas
		}
	})
})

const alterable = ref<boolean>(true)
function alterarPre(variacion: number) {
	if (!alterable) return
	pre.value += variacion
	if (pre.value < 1) pre.value = 1
}
function alterarAccion(variacion: number) {
	if (!alterable) return
	accion.value += variacion
	if (accion.value < 1) accion.value = 1
}
function alterarDescanso(variacion: number) {
	if (!alterable) return
	descanso.value += variacion
	if (descanso.value < 1) descanso.value = 1
}
function alterarRondas(variacion: number) {
	if (!alterable) return
	rondas.value += variacion
	if (rondas.value < 1) rondas.value = 1
}

function iniciarCronometro() {
	alterable.value = false
	setTimeout(() => {
		alterable.value = true
	}, 1000)
}

// async function iniciarTabata () {
// 	// Iniciar preparacion
// 	await
// 	// Repetir rondas
// 	for (const ronda in Array(rondas.value)) {
// 		// Iniciar accion
// 		// Iniciar descanso
// 	}

// }
</script>
<style lang="sass" scoped>
.lineaPreparacion
	background-color: #eee

.bloquePrevio,
.bloqueRondas
	background-color: #ddd
	.lineaAccion
		background-color: #eee
	.lineaDescanso
		background-color: #eee
	// .lineaRondas
		background-color: #eee


.icoBoton
	opacity: .5
.valor
	min-width: 5rem
.configuradorTiempo
	background-color: #333
	color: #fff
</style>
