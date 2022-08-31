

export const useConsolo = () => {
	const configuracion = useRuntimeConfig()
	const consolo = configuracion.public.dev ? console : {
		log: () => {},
		info: () => {},
		warn: () => {},
		error: () => {},
		time: () => {},
		timeEnd: () => {}
	}

	return consolo
}

// const loguear = true



// export const consolo = ()