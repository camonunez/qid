<template lang="pug">
.flex.jcc.aic.minh100vh

	.anchoComun
		h1 Hola {{ $route.params.id }}

</template>
<script setup>
async function obtenerWeas () {
	const { data, pending, error, refresh } = await useFetch('https://api.nuxtjs.dev/mountains',{
			pick: ['title']
	})
}
</script>
