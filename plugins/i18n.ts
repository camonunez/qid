import { defineNuxtPlugin } from 'nuxt/app'

type IdiomasDisponibles = 'es' | 'en'
const configuracion: {
	idiomaActivo: IdiomasDisponibles
} = {
	idiomaActivo: 'es'
}


type ArmarObjeto<I extends string[]> = I extends [] ? never : { [k in I[number]]: string }

type EntradaRosettaConVariables<TI extends VariacionesEnIdiomas> = TI[keyof TI] extends `${infer _pre}{{${infer Variable}}}${infer _post}` ? ArmarObjeto<[Variable]> : never

type VariacionesEnIdiomas = { [IdiomaID in IdiomasDisponibles]: string }
type Rosetta = { [TraducirID: string]: VariacionesEnIdiomas }

export const rosetta = <SetDeTraducciones extends Rosetta>(setTraducciones: SetDeTraducciones) => {


	type ROSet = Readonly<SetDeTraducciones>
	type VariablesPorTraduccionID = {[TraduccionID in keyof ROSet]: EntradaRosettaConVariables<ROSet[TraduccionID]>}

	function supertraducir<
		TraducirID extends keyof ROSet
	>(traduccionID: TraducirID): ROSet[TraducirID] extends EntradaRosettaConVariables<ROSet[TraducirID]> ? never: string

	function supertraducir<
		TraducirID extends keyof ROSet,
		Variables extends VariablesPorTraduccionID[TraducirID]
	>(
		traduccionID: TraducirID,
		variables: Variables
	): string

	function supertraducir<
		TraducirID extends keyof ROSet,
		Variables extends VariablesPorTraduccionID[TraducirID]
	>(
		traduccionID: TraducirID,
		variables?: Variables
	) {
		try {

		const idiomaActivo = configuracion.idiomaActivo

		const traducciones = setTraducciones[traduccionID]
		const traducido = traducciones[idiomaActivo]

		if (variables === undefined) return traducido

		// console.log('traducido', traducido)
		let resultado = traducido

		for (const variableID in variables) {
			// console.log('variableID', variableID)
			const reemplazante = variables[variableID]
			resultado = resultado.replace(`{{${variableID}}}`, `${reemplazante}`)
		}

		return resultado
		} catch (e) {
			console.log('error', e)
			return '🪲'
		}
	}
	return supertraducir
}

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
