<template lang="pug">
.qrWrapper
	.elQR(v-html="qr")
	.tac(v-if="url" @click="generarQR") {{id}}
</template>
<script setup lang="ts">
import QRCodeStyling, {
	Options
} from 'qr-code-styling';
import MiniID from '@/lib/miniid';

const qr = ref<string>()
const id = await MiniID()

let generadorQR: QRCodeStyling | null = null
async function generarQRConEstilo(texto: string): Promise<void> {
	// if (!qr.value) {
	// 	return
	// }
	// const id = await MiniID()
	const config = {
		width: 100,
		height: 100,
		type: "svg",
		data: texto,
		// image: "/favicon.svg",
		dotsOptions: {
			color: "#000000",
			type: "rounded"
		},
		backgroundOptions: {
			color: "#ffffff",
		},
		// imageOptions: {
		// 	crossOrigin: "anonymous",
		// 	margin: 4
		// }
	} as Options
	
	generadorQR = new QRCodeStyling(config);
	const getRawData = await generadorQR.getRawData('svg') 
	const svg = generadorQR._svg
	if (!svg) {
		console.error('sin svg')
		return
	}
	const svgString = svg.outerHTML
	const svgListo = svgString.replaceAll('clip-path-background-color', `el-${id}-clip-path-background-color`).replaceAll('clip-path-dot-color', `el-${id}-clip-path-dot-color`)
	
	qr.value = svgListo
}

function generarQR () {
	if (!props.url) return
	generarQRConEstilo(props.url)
}

watch(qr, async (qrAhora, qrAntes) => {
	if (!qrAntes && qrAhora && props.url) {
		await generarQRConEstilo(props.url)
	}
})

const props = defineProps<{
	id: string
	url: string
}>()

watch(() => props.url, async (url) => {
	if (url) {
		await generarQRConEstilo(url)
	}
}, { immediate: true })

// }, { immediate: true })
// function logQRRef() {
// 	console.log('qr.value', qr.value)
// }
onMounted(() => {
	// console.log('url.value', url.value)
	if (props.url) generarQR()
})

</script>
<style lang="sass" scoped>
// .qrWrapper
// 	page-break-inside: avoid
// 	border: 1px solid red
</style>