<template lang="pug">
//- .elQR(v-html="qr")
div
	.elQR(ref="qr")
	button(@click="logQRRef") logQRRef
</template>
<script setup lang="ts">
// import QRCode from 'qrcode'
import QRCodeStyling, {
	Options
} from 'qr-code-styling';

const qr = ref<HTMLDivElement>()
// const qr = ref<string | null>(null)

// async function generarQR (texto: string): Promise<string> {
// 	return await new Promise((resolve, reject) => {
// 		QRCode.toString(texto, { type: 'svg' }, (err, svg) => {
// 			if (err) reject(err)
// 			return resolve(svg)
// 		})
// 	})
// }
let generadorQR: QRCodeStyling | null = null
async function generarQRConEstilo(texto: string): Promise<void> {
	if (!qr.value) {
		console.log('No se ha encontrado el elemento')
		return
	}
	const config = {
		width: 300,
		height: 300,
		type: "svg",
		data: texto,
		image: "/favicon.svg",
		dotsOptions: {
			color: "#000000",
			type: "rounded"
		},
		backgroundOptions: {
			color: "#ffffff",
		},
		imageOptions: {
			crossOrigin: "anonymous",
			margin: 14
		}
	} as Options
	if (!generadorQR) {
		generadorQR = new QRCodeStyling(config);
	} else {
		generadorQR.update(config)
	}

	qr.value.innerHTML = '';
	while (qr.value.lastElementChild) {
		qr.value.removeChild(qr.value.lastElementChild)
	}

	generadorQR.append(qr.value)
}

const props = defineProps<{
	texto: string
}>()


watch(qr, async (qrAhora, qrAntes) => {
	if (!qrAntes && qrAhora && url.value) {
		await generarQRConEstilo(url.value)
	}
})

const url = computed(() => props.texto ? `https://go.boxmagic.app/referencia?${props.texto}` : null)
watch(url, async (url) => {
	if (url) {
		await generarQRConEstilo(url)
	}
})

// }, { immediate: true })
function logQRRef() {
	console.log('qr.value', qr.value)
}
onMounted(() => {
	console.log('url.value', url.value)
	if (url.value) generarQRConEstilo(url.value)
})

</script>