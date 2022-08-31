

const consoloff = {
	log: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
	time: () => {},
	timeEnd: () => {}
}

const loguear = true

const consolo = loguear ? console : consoloff


export default consolo