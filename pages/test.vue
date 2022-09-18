<template lang="pug">
div
	pre codigo {{codigo}}
	UiInputNumerico(v-model="codigo" etiqueta="****")
	UiInputCodigo(v-model="codigo" etiqueta="****")

</template>
<script setup lang="ts">
import { ref } from 'vue'

const codigo = ref<string>('')

</script>
