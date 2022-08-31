import consolo from './consolo'

type SetEventos = { [evento: string]: Function[] }
type EmisorEventos = {
	on: (evento: string, funcion: Function) => void
	off: (evento: string, funcion: Function) => void
	emit: (evento: string, ...args: any[]) => void
}

function crearEmisorEventos(): EmisorEventos {
	const eventos: SetEventos = {}

	const emisorEventos: EmisorEventos = {
		on(evento: string, listener: Function): void {
			if (!eventos[evento]) eventos[evento] = []
			eventos[evento].push(listener)
		},

		off(evento: string, listenerToRemove: Function): void {
			if (!eventos[evento]) {
				consolo.warn(`Evento "${evento}" no existe.`)
				return
			}
			const filterListeners = (listener: Function) => listener !== listenerToRemove
			eventos[evento] = eventos[evento].filter(filterListeners)
		},

		emit(evento: string, data: any) {
			if (!eventos[evento]) {
				consolo.warn(`No se puede emitir evento "${evento}", no existe.`)
				return
			}
			const fireCallbacks = (callback: Function) => {
				callback(data)
			}
			eventos[evento].forEach(fireCallbacks)
		}
	}
	return emisorEventos
}

export default crearEmisorEventos
