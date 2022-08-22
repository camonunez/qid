<template lang="pug">
.anchoWrapper.minh100vh

	.my2rem
		NuxtLink(to="/timer/tabata") Tabata
	.centerized
		h2 Countdown
		//- #over(style="display: none") Time is over

		.flex.aic.radio.cajaCronometro
			//- .icoBoton.fz2rem.lh1
				i-akar-icons-circle-minus-fill
			.cronometro.valor.radio.flex.jcc.aifs.p1rem
				.fz8rem.fontDigital {{tiempoCronometrado.format('mm:ss')}}
				.fz2rem.fontDigital.ml1rem {{tiempoCronometrado.format('SSS')}}

		.p2rem
			button(@mousedown="cronometrar" :disabled="cronometro.estaIniciado && !cronometro.estaTerminado")
				.flex.ffcn.jcc.aic
					i-pixelarticons-play.fz2rem
					span.pt-02rem Iniciar
			button(@click="pausar" :disabled="cronometro.estaTerminado || cronometro.estaPausado")
				.flex.ffcn.jcc.aic
					i-carbon-pause-outline-filled.fz2rem
					span.pt-02rem Pausar
			button(@click="reanudar" :disabled="!cronometro.estaPausado")
				.flex.ffcn.jcc.aic
					i-pixelarticons-pause.fz2rem
					span.pt-02rem Reanudar
			button(@click="terminar" :disabled="cronometro.estaTerminado")
				.flex.ffcn.jcc.aic
					i-pixelarticons-play.fz2rem
					span.pt-02rem Terminar 

	div
		.pb2rem
			h3 Historial

		//- .cronometrados keys {{Object.keys(historialCronometrados)}}
		//- .cronometrados length {{Object.keys(historialCronometrados).length}}

		.cronometrados(v-if="Object.keys(historialCronometrados).length > 0")

			.cronometrado(v-for="crono in historialCronometrados" :key="crono.id")

				.flex.jcsb 
					// Inicio y fin
					.flex
						div(v-if="crono.tiempoAlInicio") {{crono.tiempoAlInicio.format('H:mm a')}}
						div(v-if="crono.tiempoAlTerminar") {{crono.tiempoAlTerminar.format('H:mm a')}}

					// Pausas
					.flex(v-if="crono.historial")
						div {{crono.historial.filter(h => h.evento === 'reanudacion').length}} Pausas

					// Tiempo cronometrado
					div(v-if="crono.tiempoCronometrado") 
						| {{dayjs.duration(crono.tiempoCronometrado).format('m')}} minutos, {{dayjs.duration(crono.tiempoCronometrado).format('s')}} segundos

				//.flex.jcsb(v-for="registro in crono.historial")

				// Fin
				//.flex.jcsb 
					//- div(v-if="crono.tiempoAlInicio") {{crono.tiempoAlInicio.format('H:mm a')}}
					.div(v-if="crono.tiempoAlTerminar") {{crono.tiempoAlTerminar.format('H:mm a')}}

					div(v-if="crono.tiempoCronometrado") {{dayjs.duration(crono.tiempoCronometrado).format('HH:mm:ss SSS')}}
					//- .fin(v-if="crono.tiempoCronometrado") {{dayjs.duration(crono.tiempoCronometrado).humanize()}}


</template>
<script setup lang="ts">
import { onMounted, reactive, computed, ref, nextTick } from 'vue'

import dayjs from '@/lib/fechas'
import type {Dayjs} from '@/lib/fechas'
import { MiniID } from '@/lib/miniid'

import { rosetta } from '@/plugins/i18n'

const t = rosetta({
	estoEsUnLanding: {
		es: 'Esto es un landing',
		en: 'This is a landing'
	},
	holaNombre: {
		es: 'Hola {{nombre}}',
		en: 'Hello {{nombre}}'
	}
} as const)


type Cronometrado = {
	id: string

	tiempoAlInicio: Dayjs
	tiempoAlTerminar: Dayjs
	tiempoCronometrado: number

	historial: {
		evento: string
		tiempo: Dayjs
	}[]
}

const historialCronometrados = ref<Record<string, Cronometrado>>({})

type Cronometro = {
	tiempoAlInicio: Dayjs | null
	tiempoAlTerminar: Dayjs | null

	tiempoAlPausar: Dayjs | null

	tiempoAlTranscurrido: Dayjs | null
	tiempoCronometrado: number
	// tiempoCronometrado: Dayjs | null

	estaIniciado: boolean
	estaPausado: boolean
	estaTerminado: boolean,

	historial: {
		evento: 'pausa' | 'reanudacion'
		tiempo: Dayjs
	}[]
}

const nuevoCronometro = () => ({
	tiempoAlInicio: null,
	tiempoAlTerminar: null,

	tiempoAlPausar: null,

	tiempoAlTranscurrido: null,
	tiempoCronometrado: 0,

	estaIniciado: false,
	estaPausado: false,
	estaTerminado: false,

	historial: []
})

const cronometro = ref<Cronometro>(nuevoCronometro())

const tiempoCronometrado = computed (() => {
	return dayjs.duration(cronometro.value.tiempoCronometrado)
})

function cronometrar() {
	const ahora = dayjs()

	// Inicio
	if (!cronometro.value.estaIniciado) {
		cronometro.value.estaIniciado = true
		cronometro.value.tiempoAlInicio = ahora
		cronometro.value.estaTerminado = false
	}

	// Abortar si está pausado o terminado
	if (cronometro.value.estaPausado) {
		// console.log('Abortando cronometro estaPausado', JSON.parse(JSON.stringify(cronometro.value)))
		return
	}
	if (cronometro.value.estaTerminado) {
		// console.log('Abortando cronometro estaTerminado', JSON.parse(JSON.stringify(cronometro.value)))
		return
	}
	if (cronometro.value.estaTerminado) {
		// console.log('Abortando cronometro estaTerminado', JSON.parse(JSON.stringify(cronometro.value)))
		return
	}

	// Corre el tiempo
	const duracionTramoAnterior = cronometro.value.tiempoAlTranscurrido ? dayjs.duration(ahora.diff(cronometro.value.tiempoAlTranscurrido)).asMilliseconds() : 0
	cronometro.value.tiempoCronometrado += duracionTramoAnterior
	cronometro.value.tiempoAlTranscurrido = ahora

	// Seguir cronometrando
	nextTick(() => window.requestAnimationFrame(cronometrar))
}

function pausar() {
	if (cronometro.value.estaPausado) return

	const ahora = dayjs()

	// Registrar tiempo hasta la pausa
	const duracionJustoAntesDePausar = dayjs.duration(ahora.diff(cronometro.value.tiempoAlTranscurrido))
	cronometro.value.tiempoCronometrado += duracionJustoAntesDePausar.asMilliseconds()
	cronometro.value.tiempoAlTranscurrido = ahora

	// console.log({
	// 	tiempoCronometrado: cronometro.value.tiempoCronometrado,
	// 	tiempoAlTranscurrido: cronometro.value.tiempoAlTranscurrido
	// })
	// Pausar
	cronometro.value.estaPausado = true
	cronometro.value.tiempoAlPausar = ahora
	cronometro.value.historial.push({
		evento: 'pausa',
		tiempo: ahora
	})
}

function reanudar() {
	if (!cronometro.value.estaPausado) return

	const ahora = dayjs()

	console.log('reanudar', {
		tiempoCronometrado: cronometro.value.tiempoCronometrado,
		tiempoAlTranscurrido: cronometro.value.tiempoAlTranscurrido
	})

	// Registrar ahora como el puevo punto de partida
	cronometro.value.tiempoAlTranscurrido = ahora

	// Quitar pausa
	cronometro.value.estaPausado = false
	cronometro.value.tiempoAlPausar = null
	cronometro.value.historial.push({
		evento: 'reanudacion',
		tiempo: ahora
	})

	
	nextTick(() => {
		// console.log('reanudando', {
		// 	tiempoCronometrado: cronometro.value.tiempoCronometrado,
		// 	tiempoAlTranscurrido: cronometro.value.tiempoAlTranscurrido
		// })
		window.requestAnimationFrame(cronometrar)
	})
}

async function terminar() {
	if (cronometro.value.estaTerminado) return

	// Marcar como terminado y esperar que se detenga el cronometro
	cronometro.value.estaTerminado = true
	cronometro.value.tiempoAlTerminar = dayjs()
	await new Promise(resolve => { window.requestAnimationFrame(resolve) })

	if (!cronometro.value.tiempoAlInicio) throw 'Falta tiempoAlInicio del cronometro'
	const id = await MiniID()
	const porGuardar: Cronometrado = {
		id,
		tiempoAlInicio: cronometro.value.tiempoAlInicio,
		tiempoAlTerminar: cronometro.value.tiempoAlTerminar,
		tiempoCronometrado: cronometro.value.tiempoCronometrado,
		historial: cronometro.value.historial,
	}
	historialCronometrados.value[id] = porGuardar

	// Reset del cronometro
	cronometro.value = nuevoCronometro()
}

onMounted(() => {
	console.log(`reloj is now mounted.`)
})

</script>
<style lang="sass" scoped>
@import '@/sass/comun'
.cajaCronometro
	background-color: #14151A
	.cronometro
		color: #FDDA00
</style>
