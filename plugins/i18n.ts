import { defineNuxtPlugin } from 'nuxt/app'
import _, { get as _get } from 'lodash'
// import { unknown, z } from 'zod'
// import { List, String, Union } from 'ts-toolbelt'

type IdiomasDisponibles = 'es' | 'en'
const configuracion: {
	idiomaActivo: IdiomasDisponibles
} = {
	idiomaActivo: 'es'
}

// type GrupoTraducciones<T extends {[idiomaID in IdiomasDisponibles]: T[keyof T]}> = keyof T extends IdiomasDisponibles ? {[idioma in IdiomasDisponibles]: T[keyof T]} : never

export type Interpolado<T extends string> = T extends Interpolable<T> ? ArmarObjeto<ExtraerVariables<T>> : never

//

type Interpolable<T> = T extends `${infer pre}{{${infer Variable}}}${infer post}` ? T : never
// type VariableInterpolable<T extends string> = T extends Interpolable<T> ? ArmarObjeto<ExtraerVariables<T>> : never



type VariablesInterpolables<T extends string> = string extends T
? string[]
: T extends ''
? []
: T extends `${infer pre}{{${infer Variable}}}${infer post}`
? [Variable, ...ExtraerVariables<post>]
: []


type ArmarObjeto<I extends string[]> = I extends [] ? never : { [k in I[number]]: string | number }

type ExtraerVariables<T extends string> = string extends T
	? string[]
	: T extends ''
	? []
	: T extends `${infer pre}{{${infer Variable}}}${infer post}`
	? [Variable, ...ExtraerVariables<post>]
	: []

type VariablesModificadoras<T> = T extends string ? ArmarObjeto<ExtraerVariables<T>> : never

type Rosetta = { [TraducirID: string]: { [IdiomaID in IdiomasDisponibles]: string } }

const rosetta = <SetDeTraducciones extends Rosetta>(setTraducciones: SetDeTraducciones) => {
	const idiomaActivo = configuracion.idiomaActivo

	function supertraducir<
		TraducirID extends keyof SetDeTraducciones
	>(traduccionID: TraducirID): string
	function supertraducir<
		TraducirID extends keyof SetDeTraducciones,
		Variables extends VariablesModificadoras<SetDeTraducciones[TraducirID][typeof idiomaActivo]>
	>(
		traduccionID: TraducirID,
		variables: Variables
	): SetDeTraducciones[TraducirID][typeof idiomaActivo] extends Interpolable<SetDeTraducciones[TraducirID][typeof idiomaActivo]> ? string : never

	function supertraducir<
		TraducirID extends keyof SetDeTraducciones,
		Variables extends VariablesModificadoras<SetDeTraducciones[TraducirID][typeof idiomaActivo]>
	>(
		traduccionID: TraducirID,
		variables?: Variables
	) {
		const idiomaActivo = configuracion.idiomaActivo

		const traducciones = setTraducciones[traduccionID]
		const traducido = traducciones[idiomaActivo]

		if (variables === undefined) return traducido

		console.log('traducido', traducido)
		let resultado = traducido
		Object.keys(variables).forEach((variableID) => {
			console.log('variableID', variableID)
			resultado = resultado.replace(`{{${variableID}}}`, variables[variableID])
		})

		return resultado
	}
	return supertraducir
}

const testTraducciones = rosetta({
	hola: {
		es: 'Hola',
		en: 'Hello'
	}
})

const pruebaTraduccion = testTraducciones('hola', { nombre: 'Pepe' })

const test1 = rosetta({
	hola: {
		es: 'Hola',
		en: 'Hello'
	},
	adios: {
		es: 'Adios',
		en: 'Bye'
	},
	puedeComerNManzanas: {
		es: 'Puede comer {{cantidad}} manzanas',
		en: 'Can eat {{cantidad}} apples'
	}
})

const a = test1('hola', {asd: 'asdasd'})
const b = test1('puedeComerNManzanas', { cantidad: true })
console.log('a', a)
console.log('b', b)

rosetta.elegirIdiomaVisible = function (idiomaAVisibilizar: IdiomasDisponibles) {
	configuracion.idiomaActivo = idiomaAVisibilizar
}

export default defineNuxtPlugin((/* nuxtApp */) => {
	return {
		provide: {
			rosetta: rosetta
		}
	}
})
