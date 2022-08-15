import { defineNuxtPlugin } from 'nuxt/app'
import _, { get as _get } from 'lodash'
import { unknown, z } from 'zod'
import { List, String, Union } from 'ts-toolbelt'
import { LiteralExpression } from 'typescript'

type IdiomasDisponibles = 'es' | 'en'
const configuracion: {
	idiomaActivo: IdiomasDisponibles
} = {
	idiomaActivo: 'es'
}

//

//

// pelotitaaaa
type Algo = {
	asd: string
	fdssd: number
}
type LlavesDeAlgo = keyof Algo

const rosetta = <
	Traducciones,
	TraduccionID extends keyof Traducciones,
	IdiomaID extends keyof Traducciones[TraduccionID]
>(
	traducciones: Traducciones
) => {
	return (
		traduccionID: TraduccionID,
		variables?: {
			[variableID: string]: string | number
		}
	) => {
		const idiomaActivo = configuracion.idiomaActivo

		const traducible = traducciones[traduccionID]
		const traducido = traducible[idiomaActivo]

		if (!variables) return traducido

		// Ver si es interpolable
		const enDosLlaves = new RegExp(/\{\{(.\S*?)\}\}/g)
		const interpolableAInterpolacion = z.string().regex(enDosLlaves)

		const testParseo = interpolableAInterpolacion.safeParse(traducido)
		if (!testParseo.success) return traducido

		type SecondQueryPart = String.Split<typeof testParseo.data, '{{'>
		const matches = testParseo.data.matchAll(enDosLlaves)
		// Interpolar variables

		// type GetReturnType<Type> = Type extends (...args: never[]) => infer Return ? Return : never

		// type probar<Tipo> = Tipo extends (...args: never[]) => {

		// 	type SecondQueryPart = String.Split<Tipo, "?">[1];

		// 	type QueryElements = String.Split<SecondQueryPart, "&">;

		// 	type QueryParams = {
		// 		[QueryElement in QueryElements[number]]: {
		// 			[Key in String.Split<
		// 				QueryElement,
		// 				"="
		// 			>[0]]: String.Split<QueryElement, "=">[1];
		// 		};
		// 	}[QueryElements[number]];

		// 	type ParamsObj = Union.Merge<QueryParams>
		// 	return ParamsObj;
		// }

		// const query = '/home?as=foo&db=wow';
		// // type Query = typeof query
		// const prueba = probar<typeof query>()

		// prueba

		// return interpolarTraduccion(traducido, variables)
	}
}

// const rosetta = <
// 	Traducciones,
// 	TraduccionID extends keyof Traducciones,
// 	IdiomaID extends IdiomasDisponibles,
// 	Traducido extends keyof Traducciones[TraduccionID][IdiomaID],
// >(
// 	traducciones: Traducciones
// ) => {

// 	return (
// 		traduccionID: TraduccionID,
// 		variables?: Variables
// 	) => {
// 		const traducido = traducciones[traduccionID][configuracion.idiomaActivo]
// 		if (!variables) return traducido
// 		return interpolarTraduccion(traducido, variables)
// 	}
// }

const test1 = rosetta({
	hola: {
		es: 'Hola',
		en: 'Hello'
	},
	// holo: 'asdasd',
	// saludos: {
	// 	es: 'Saludos'
	// },
	adios: {
		es: 'Adios',
		en: 'Bye'
	},
	puedeComerNManzanas: {
		es: 'Puede comer {{cantidad}} manzanas',
		en: 'Can eat {{cantidad}} apples'
	}
})

const a = test1('hola')
const b = test1('puedeComerNManzanas', { cantidad: '5' })
console.log(a)
console.log(b)

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
