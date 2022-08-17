<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	.centerized
		h2 Countdown
		//- #over(style="display: none") Time is over

		div tiempoTranscurrido {{tiempoTranscurrido.format('HH:mm:ss SSS')}}
		div typeof tiempoTranscurrido {{typeof tiempoTranscurrido}}

		.p2rem
			button(@click="cronometrar" :disabled="cronometro.estaIniciado && !cronometro.estaTerminado") Iniciar
			button(@click="pausar" :disabled="cronometro.estaTerminado || cronometro.estaPausado") Pausar
			button(@click="reanudar" :disabled="!cronometro.estaPausado") Reanudar
			button(@click="terminar" :disabled="cronometro.estaTerminado") Terminar 

	div
		.pb2rem
			h3 Historial

		.cronometrados keys {{Object.keys(historialCronometrados)}}
		.cronometrados length {{Object.keys(historialCronometrados).length}}
		.cronometrados(v-if="Object.keys(historialCronometrados).length > 0")
			.cronometrado(v-for="crono in historialCronometrados" :key="crono.id")
				.flex.jcsb 
					.inicio(v-if="crono.tiempoAlInicio") {{crono.tiempoAlInicio.format('HH:mm:ss SSS')}}
					.inicio(v-if="crono.tiempoAlTerminar") {{crono.tiempoAlTerminar.format('HH:mm:ss SSS')}}


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
	tiempoTranscurrido: number
}

const historialCronometrados = ref<Record<string, Cronometrado>>({})

type Cronometro = {
	tiempoAlInicio: Dayjs | null
	tiempoAlTerminar: Dayjs | null

	tiempoAlPausar: Dayjs | null

	tiempoAlTranscurrido: Dayjs | null
	tiempoTranscurrido: number
	// tiempoTranscurrido: Dayjs | null

	estaIniciado: boolean
	estaPausado: boolean
	estaTerminado: boolean
}

const nuevoCronometro = () => ({
	tiempoAlInicio: null,
	tiempoAlTerminar: null,

	tiempoAlPausar: null,

	tiempoAlTranscurrido: null,
	tiempoTranscurrido: 0,

	estaIniciado: false,
	estaPausado: false,
	estaTerminado: false
})
const cronometro = ref<Cronometro>(nuevoCronometro())

const tiempoTranscurrido = computed (() => {
	return dayjs.duration(cronometro.value.tiempoTranscurrido)
})

function cronometrar() {
	const ahora = dayjs()

	// Inicio
	if (!cronometro.value.estaIniciado) {
		cronometro.value.estaIniciado = true
		cronometro.value.tiempoAlInicio = ahora
	}

	// Abortar si está pausado o terminado
	if (cronometro.value.estaPausado) {
		console.log('Abortando cronometro estaPausado', JSON.parse(JSON.stringify(cronometro.value)))
		return
	}
	if (cronometro.value.estaTerminado) {
		console.log('Abortando cronometro estaTerminado', JSON.parse(JSON.stringify(cronometro.value)))
		return
	}

	// Corre el tiempo
	const duracionTramoAnterior = cronometro.value.tiempoAlTranscurrido ? dayjs.duration(ahora.diff(cronometro.value.tiempoAlTranscurrido)).asMilliseconds() : 0
	cronometro.value.tiempoTranscurrido += duracionTramoAnterior
	cronometro.value.tiempoAlTranscurrido = ahora

	// Seguir cronometrando
	// window.requestAnimationFrame(cronometrar)
	nextTick(() => window.requestAnimationFrame(cronometrar))
}

function pausar() {
	if (cronometro.value.estaPausado) return

	const ahora = dayjs()

	// Registrar tiempo hasta la pausa
	const duracionJustoAntesDePausar = dayjs.duration(ahora.diff(cronometro.value.tiempoAlTranscurrido))
	cronometro.value.tiempoTranscurrido += duracionJustoAntesDePausar.asMilliseconds()
	cronometro.value.tiempoAlTranscurrido = ahora

	console.log({
		tiempoTranscurrido: cronometro.value.tiempoTranscurrido,
		tiempoAlTranscurrido: cronometro.value.tiempoAlTranscurrido
	})
	// Pausar
	cronometro.value.estaPausado = true
	cronometro.value.tiempoAlPausar = ahora
}

function reanudar() {
	if (!cronometro.value.estaPausado) return

	const ahora = dayjs()

	console.log('reanudar', {
		tiempoTranscurrido: cronometro.value.tiempoTranscurrido,
		tiempoAlTranscurrido: cronometro.value.tiempoAlTranscurrido
	})

	// Registrar ahora como el puevo punto de partida
	cronometro.value.tiempoAlTranscurrido = ahora

	// Quitar pausa
	cronometro.value.estaPausado = false
	cronometro.value.tiempoAlPausar = null

	
	nextTick(() => {

		console.log('reanudando', {
			tiempoTranscurrido: cronometro.value.tiempoTranscurrido,
			tiempoAlTranscurrido: cronometro.value.tiempoAlTranscurrido
		})
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
		tiempoTranscurrido: cronometro.value.tiempoTranscurrido,
	}
	historialCronometrados.value[id] = porGuardar

	console.log('%c Pre Reset del cronometro', 'color: orange', JSON.parse(JSON.stringify(cronometro.value)))
	await nextTick()
	// Reset del cronometro

	console.log('%c Reset del cronometro', 'color: yellow', JSON.parse(JSON.stringify(cronometro.value)))
	cronometro.value = nuevoCronometro()
	await nextTick()
	await nextTick()
	console.log('%c cronometro reseteado', 'color: blue', JSON.parse(JSON.stringify(cronometro.value)))
}

onMounted(() => {
	console.log(`reloj is now mounted.`)
})

</script>
<style lang="sass" scoped></style>
