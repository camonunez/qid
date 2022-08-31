<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 Hola {{ $route.params.id }}

</template>
<script setup>
const config = useRuntimeConfig()
console.log('config', config)
const url = `${config.public.apiURL}/count`
console.log('url', url)
const r = await useFetch(url)
console.log('r', r)
console.log('r.error', r.error)

definePageMeta({
	title: 'Cuerdos'
})
</script>
