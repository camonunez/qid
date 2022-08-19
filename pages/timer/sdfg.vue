<template lang="pug">
//- .flex.jcc.aic.minh100vh
.anchoWrapper.minh100vh

	div
		h2 Configuracion

		div 
			.flex.jcsb
				.fwl Preparación
				code.fwb {{multiCronometroConfig.preparacionSegundos}}
			.flex
				button(@click="multiCronometroConfig.preparacionSegundos -= 10") -10
				button(@click="multiCronometroConfig.preparacionSegundos--") -1
				button(@click="multiCronometroConfig.preparacionSegundos++") +1
				button(@click="multiCronometroConfig.preparacionSegundos += 10") +10

		div 
			.flex.jcsb
				.fwl Accion
				code.fwb {{multiCronometroConfig.accionSegundos}}
			.flex
				button(@click="() => { multiCronometroConfig.accionSegundos -= 10 }") -10
				button(@click="() => { multiCronometroConfig.accionSegundos -= 1 }") -1
				button(@click="() => { multiCronometroConfig.accionSegundos += 1 }") +1
				button(@click="() => { multiCronometroConfig.accionSegundos += 10 }") +10
		div 
			.flex.jcsb
				.fwl Descanso
				code.fwb {{multiCronometroConfig.descansoSegundos}}
			.flex
				button(@click="multiCronometroConfig.descansoSegundos -= 10") -10
				button(@click="multiCronometroConfig.descansoSegundos -= 1") -1
				button(@click="multiCronometroConfig.descansoSegundos += 1") +1
				button(@click="multiCronometroConfig.descansoSegundos += 10") +10

		div 
			.flex.jcsb
				.fwl Rondas
				code.fwb {{multiCronometroConfig.rondas}}
			.flex
				button(@click="multiCronometroConfig.rondas -= 10") -10
				button(@click="multiCronometroConfig.rondas -= 1") -1
				button(@click="multiCronometroConfig.rondas += 1") +1
				button(@click="multiCronometroConfig.rondas += 10") +10



</template>
<script setup lang="ts">
import { ref } from 'vue'

const nuevoMultiCronometro = () => ({
	preparacionSegundos: 10,
	accionSegundos: 20,
	descansoSegundos: 10,
	rondas: 8
})

type MultiCronometroConfig = {
	preparacionSegundos: number
	accionSegundos: number
	descansoSegundos: number
	rondas: number
}
const multiCronometroConfig = ref<MultiCronometroConfig>(nuevoMultiCronometro())


</script>
<style lang="sass" scoped></style>
