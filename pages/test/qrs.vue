<template lang="pug">
.root
	.qrs
		.qr(v-for="id in ids")
			RenderQr(:id="id" :url="urlConID(id)" :key="id")
</template>
<script setup lang="ts">
import MiniID from '@/lib/miniid';

const ids = ref<string[]>([])

async function generarIDs () {
	const veces = Array(80).fill(1)
	const nuevosIDs: string[] = []
	const ok = await Promise.all(veces.map(async () => {
		const id = await MiniID()
		nuevosIDs.push(id)
	}))
	ids.value = nuevosIDs
}
onMounted(() => {
	generarIDs()
})

function urlConID (id: string) {
	return `https://qid.cl/i/${id}`
}
</script>
<style lang="sass" scoped>
.root
	min-height: 100vh
	background-color: #fff
.qrs
	display: table
	.qr
		display: inline-block
		padding: .75rem
		border: .5px solid #ddd
		page-break-inside: avoid
</style>
