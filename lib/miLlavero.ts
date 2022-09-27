import { LlaveroInterno } from './llavero'
import localforage from 'localforage'
import MiniID from './miniid'

const llaveroStore = localforage.createInstance({ name: 'llaveroStore' })

let llaveroInternoCache: LlaveroInterno | null = null

export async function obtenerLlaveroPropio() {
	// Usar cache
	if (llaveroInternoCache) return llaveroInternoCache

	console.log('Obteniendo llavero de DB')
	// Obtener de base de datos
	const llaveroAlmacenado = await llaveroStore.getItem<LlaveroInterno>('miLlavero')
	console.log('Llavero de localforage', llaveroAlmacenado)

	if (llaveroAlmacenado) {
		llaveroInternoCache = new LlaveroInterno(llaveroAlmacenado)
		return llaveroInternoCache
	}

	// Crear llavero
	console.log('Creando nuevo llavero')
	const nuevoID = await MiniID()
	const llavero = await LlaveroInterno.crear(nuevoID)
	const llaveroAlmacenable = await llavero.exportar()
	await llaveroStore.setItem('miLlavero', llaveroAlmacenable)
	llaveroInternoCache = llavero

	return llaveroInternoCache
}