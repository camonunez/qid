import { defineNuxtPlugin } from 'nuxt/app'
import { reactive, readonly } from 'vue'
import dayjs, { Dayjs } from '@/lib/fechas'

console.log('FECHAS', 'process.client', process.client)
const reloj = reactive({
	ahora: dayjs(),
	hoy: dayjs().startOf('day'),
	timezone: dayjs.tz.guess()
})

function actualizar() {
	reloj.ahora = dayjs()
	if (!reloj.hoy.isSame(reloj.ahora, 'day')) {
		reloj.hoy = reloj.ahora.startOf('day')
	}
	const proxMinuto = dayjs().second(0).add(1, 'minute')
	setTimeout(function () {
		actualizar()
	}, proxMinuto.diff(reloj.ahora))
}
if (process.client) actualizar()


export default defineNuxtPlugin((/* nuxtApp */) => {
	return {
		provide: {
			dayjs,
			ahora: readonly(reloj).ahora,
			hoy: readonly(reloj).hoy,
			timezone: readonly(reloj).timezone
		}
	}
})
