<template lang="pug">
div
	NuxtChild

</template>
<script setup>
const { $usuario } = useNuxtApp()

function log(msg) { console.log(msg) }

useHead({
	title: 'Reloj'
})
</script>
