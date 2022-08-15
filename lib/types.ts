type ExtraerVariables<S extends string> = string extends S
	? string[]
	: S extends ''
	? []
	: S extends `${infer pre}{{${infer Variable}}}${infer post}`
	? [Variable, ...ExtraerVariables<post>]
	: []

type ArmarObjeto<I extends string[]> = I extends [] ? never : { [k in I[number]]: string | number }

type Interpolable<T> = T extends string ? ArmarObjeto<ExtraerVariables<T>> : never

function interpolarVars<T extends string>(textual: T): T
function interpolarVars<T extends string>(textual: T, variables: Interpolable<T>): T
function interpolarVars<T extends string>(textual: T, variables?: Interpolable<T>): string {
	if (variables !== undefined) {
		// const reemplazoIDs: (keyof Interpolable<T>)[] = Object.keys(variables) as Array<keyof Interpolable<T>>
		const parciales = Object.keys(variables).reduce(
			(resultadoParcial, variable) => {
				console.log('{resultadoParcial, variable}', { resultadoParcial, variable })
				const parcialRevisado = resultadoParcial.map((parcial: string): string[] => {
					if (parcial.startsWith('{{') && parcial.endsWith('}}') && variables[parcial.slice(2, -2)]) return [parcial]

					const separados = parcial.split(`{{${variable}}}`)
					console.log('separados', separados)
					const complementados = separados.map(separado => [separado, `{{${variable}}}`])
					console.log('complementados', complementados)
					// return complementados.flat().slice(-1)

					const flatos = complementados.flat()
					console.log('flatos', flatos)

					const norepetidos = flatos.slice(0, -1)
					console.log('norepetidos', norepetidos)
					return norepetidos
				})
				console.log('parcialRevisado', parcialRevisado)
				return parcialRevisado.flat()
			},
			[textual as string]
		)
		console.log('parciales', parciales)

		const reemplazados = parciales.map((parcial: string) => {
			if (parcial.startsWith('{{') && parcial.endsWith('}}') && variables[parcial.slice(2, -2)])
				return variables[parcial.slice(2, -2)]
			return parcial
		})
		console.log('reemplazados', reemplazados)

		return reemplazados.join('')
	} else {
		return textual
	}
}

const traducir = interpolarVars('Hola {{nombre}}, qué tal?', { nombre: 'Juan' })

console.log(traducir)
