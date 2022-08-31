<template lang="pug">
#appRoot
	NuxtChild
</template>
<script setup lang="ts">
useHead({
	title: 'My App',
	// or, instead:
	// titleTemplate: (title) => `My App - ${title}`,
	viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
	charset: 'utf-8',
	meta: [
		{ name: 'description', content: 'My amazing site.' }
	],
	link: [
		{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
		{ href: '/fonts/stylesheet.css', rel: 'stylesheet', hid: 'dmsans' }
	],
	bodyAttrs: {
		class: 'test'
	}
})
</script>
<style lang="sass">
#appRoot
	width: 100vw
	max-width: 100%
</style>