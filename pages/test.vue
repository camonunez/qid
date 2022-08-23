<template lang="pug">
div
	pre codigo {{codigo}}
	UiInputCodigo(v-model="codigo" etiqueta="****")

</template>
<script setup lang="ts">
import { ref } from 'vue'

const codigo = ref<string>('')

</script>
