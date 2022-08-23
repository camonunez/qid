<template lang="pug">
.recuPass
	transition(mode="out-in" :duration="300")

		// RECUPERACION PASSWORD
		form.formulario(v-if="modoActivo === 'solicitarRecuPass'" key="solicitarRecuPass")

			a.regresar.mb1rem(@click="$emit('volver')")
				i-carbon-caret-left
				span {{ i18n('volver') }}
			h1.titulo {{ i18n('recuperaTuPass') }}

			.formElemento

				UiInput(v-model="cuenta.email" :etiqueta="i18n('correo')" :placeholder="i18n('correo')" type="email" autocomplete="email" @keyup.enter="campoPassword && campoPassword.focus()")
					template(v-slot:preIcono)
						i-carbon-email

				//- a-input(
				//- 	vFocus
				//- 	v-model="cuenta.email"
				//- 	:placeholder="i18n('correo')"
				//- 	type="email"
				//- 	@keyup.enter="pasarA($refs.nPassword)"
				//- 	autocomplete="email"
				//- 	)
				//- 	i-carbon-email
			.formElemento

				UiInput(vFocus ref="campoPassword" v-model="cuenta.passNuevo" :etiqueta="i18n('nuevoPass')" :placeholder="i18n('nuevoPass')" :type="mostrarPass ? 'text' : 'password'" autocomplete="new-password")
					template(v-slot:preIcono)
						i-carbon-password
					template(v-slot:postIcono)
						i-carbon-view(v-if="mostrarPass" @click="mostrarPass = false")
						i-carbon-view-off(v-else @click="mostrarPass = true")

				//- a-input(
				//- 	ref="nPassword"
				//- 	v-model="cuenta.password"
				//- 	:placeholder="i18n('nuevoPass')"
				//- 	type="password"
				//- 	autocomplete="new-password"
				//- 	@keyup.enter="procesarIngreso"
				//- )
				//- 	i-carbon-password

			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(block @click="solicitarCambioPass" :loading="procesando")
						| {{ procesando ? i18n('enviandoSolicitud') : i18n('cambiarPass') }}

		// CAMBIO DE PASSWORD CON CODIGO
		form.formulario(v-else-if="modoActivo === 'cambiarPassCodigo'" key="cambiarPassCodigo")

			a.regresar.mb1rem(@click="emitir('volver')")
				i-carbon-caret-left
				span {{ i18n('volver') }}

			h1.titulo {{ i18n('codigoEnviadoAEmail') }}
			p {{ i18n('ingresaloParaConfirmar') }}
			//- p cuenta.codigo {{cuenta.codigo}} typeof: {{typeof cuenta.codigo}}

			//- .formElemento.formItemCodigo(prop="codigoSeparado" :label="i18n('codigoConfirmacion')")
				a-input.codigo(v-model="codigoSeparado[0]" placeholder="*"
					:maxLength="1"
					ref="codigo0"
					@paste="pegarCodigo"
					@keypress="soloNumeros"
					@keyup="moverCursor($event, null, $refs.codigo1)")
				a-input.codigo(v-model="codigoSeparado[1]" placeholder="*"
					:maxLength="1"
					ref="codigo1"
					@paste="pegarCodigo"
					@keypress="soloNumeros"
					@keyup="moverCursor($event, $refs.codigo0, $refs.codigo2)")
				a-input.codigo(v-model="codigoSeparado[2]" placeholder="*"
					:maxLength="1"
					ref="codigo2"
					@paste="pegarCodigo"
					@keypress="soloNumeros"
					@keyup="moverCursor($event, $refs.codigo1, $refs.codigo3)")
				a-input.codigo(v-model="codigoSeparado[3]" placeholder="*"
					:maxLength="1"
					@paste="pegarCodigo"
					ref="codigo3"
					@keypress="soloNumeros"
					@keyup="moverCursor($event, $refs.codigo2, null)")
					//- i-carbon-password


			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(@click="validarCodigo" :disabled="codigosIntentados.includes(codigoSeparado)" :loading="procesando")
						| {{ procesando ? i18n('validando') : i18n('confirmarCambioPass') }}

		// PASS CAMBIADO
		.formulario(v-else-if="modoActivo === 'cambioExitoso'" key="cambioExitoso")

			.elIcono.exitoColor
				i-carbon-checkmark-filled
			h1.titulo.tac {{ i18n('hasCambiadoPass') }}

			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(@click="ingresarPostCambioPass")
						| {{ i18n('ingresarAMiCuenta') }}

		// NO QUEDAN INTENTOS
		.formulario(v-else-if="modoActivo === 'demasiadosIntentos'" key="demasiadosIntentos")

			.elIcono
				i-carbon-error-outline

			h1.titulo.tac {{ i18n('demasiadosIntentos') }}

			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(@click="reintentar")
						| {{ i18n('reintentar') }}

		// SOLICITUD INVALIDA
		.formulario(v-else-if="modoActivo === 'solicitudInvalida'" key="solicitudInvalida")

			.elIcono
				i-carbon-error-outline

			h1.titulo.tac {{ i18n('solicitudInvalida') }}

			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(@click="reintentar")
						| {{ i18n('reintentar') }}

</template>
<script setup lang="ts">

import { useNuxtApp } from 'nuxt/app'
import { ref, reactive, computed, watch, onMounted } from 'vue'

import { rosetta } from '@/plugins/i18n'
import { z } from 'zod'

// Plugins
const { $usuario, $consolo, $cuenta } = useNuxtApp()


// i18n
const i18n = rosetta({
	// FORMULARIO
	correo: {
		es: 'Correo',
		en: 'Email',
	},
	volver: {
		es: 'Volver',
		en: 'Back',
	},
	recuperaTuPass: {
		es: 'Reestablece tu contraseña',
		en: 'Reset your password',
	},
	nuevoPass: {
		es: 'Nueva contraseña',
		en: 'New password',
	},
	enviandoSolicitud: {
		es: 'Enviando solicitud',
		en: 'Sending request',
	},
	cambiarPass: {
		es: 'Cambiar contraseña',
		en: 'Change password',
	},
	codigoEnviadoAEmail: {
		es: 'Te enviamos un código',
		en: 'We sent you a code',
	},
	ingresaloParaConfirmar: {
		es: 'Ingrésalo para confirmar el cambio de contraseña',
		en: 'Enter it to confirm the change of password',
	},
	codigoConfirmacion: {
		es: 'Código de confirmacion',
		en: 'Confirmation code',
	},
	validando: {
		es: 'Validando',
		en: 'Validating',
	},
	// acciones
	confirmarCambioPass: {
		es: 'Confirmar cambio',
		en: 'Confirm change',
	},
	operacionNoSolicitada: {
		es: 'Operación no solicitada',
		en: 'Operation not requested',
	},

	// VALIDACION
	// ingreso
	emailInvalido: {
		es: 'E-mail inválido',
		en: 'Invalid email',
	},
	ingresaTuEmail: {
		es: 'Ingresa tu e-mail',
		en: 'Enter your email',
	},
	muyCorto: {
		es: 'Muy corto',
		en: 'Too short',
	},
	muyLargo: {
		es: 'Muy largo',
		en: 'Too long',
	},
	// registro
	noOlvidesEsto: {
		es: 'No olvides esto',
		en: 'Don\'t forget this',
	},

	// EXITO
	hasCambiadoPass: {
		es: 'Contraseña guardada!',
		en: 'Password saved!',
	},
	ingresarAMiCuenta: {
		es: 'Ingresar a mi cuenta',
		en: 'Enter to my account',
	},
	// FRACASO
	codigoInvalido: {
		es: 'Código inválido',
		en: 'Invalid code',
	},
	demasiadosIntentos: {
		es: 'Demasiados intentos',
		en: 'Too many attempts',
	},
	reintentar: {
		es: 'Reintentar',
		en: 'Retry',
	},
	solicitudInvalida: {
		es: 'Solicitud inválida',
		en: 'Invalid request',
	},
})


// Props
type Modos = 'solicitarRecuPass' | 'cambiarPassCodigo' | 'cambioExitoso' | 'demasiadosIntentos' | 'solicitudInvalida'

const { email } = defineProps<{ email?: string }>()

// Refs
const campoPassword = ref<HTMLInputElement | null>(null)

// Data
const modoActivo = ref<Modos>('solicitarRecuPass')
const mostrarPass = ref<boolean>(false)
const procesando = ref<boolean>(false)
type CodigoTupla = [number | undefined, number | undefined, number | undefined, number | undefined]
const codigoSeparado = ref<CodigoTupla>([undefined, undefined, undefined, undefined])
const codigosIntentados = ref<CodigoTupla[]>([])



const emailsNoExistentes = reactive<string[]>([])
const passIncorrectos = reactive<string[]>([])

const Email = z.string().email({})
const RecuperacionPass = z.object({
	email: Email,
	passNuevo: z.string().min(6)
})

type RecuperacionPass = z.infer<typeof RecuperacionPass>

const cuenta = reactive<RecuperacionPass>({
	email: '',
	passNuevo: ''
})

const TuplaCodigo = z.tuple([
	z.number().gte(0).lte(9),
	z.number().gte(0).lte(9),
	z.number().gte(0).lte(9),
	z.number().gte(0).lte(9),
])
const EncadenadorDeCodigo = TuplaCodigo.transform(val => val.join(''))

// Watchers
watch(computed(() => cuenta.email), () => {
	// emailsNoExistentes.splice(0)
	passIncorrectos.splice(0)
})

// Events
const emitir = defineEmits(['volver', 'ingresarConNuevoPass'])

// Mounted
onMounted(() => {
	if (email) cuenta.email = email
})

// Methods
function enfocarEn(el: HTMLElement | null) {
	el && el.focus()
}

async function solicitarCambioPass() {
	try {
		const r = RecuperacionPass.safeParse(cuenta)
		if (!r.success) {
			console.log('error', r.error)
			return
		}
		const { email, passNuevo } = r.data
		$consolo.log('solicitarCambioPass', { email, passNuevo })
		procesando.value = true
		const s = await $cuenta.cambiarPass.pedirCodigo(email, passNuevo)
		if (!s.ok) {
			if (s.error) console.error(s.error)
			return
		}

		codigosIntentados.value.splice(0)
		codigoSeparado.value = [undefined, undefined, undefined, undefined]
		cuenta.email = ''
		cuenta.passNuevo = ''
		modoActivo.value = 'cambiarPassCodigo'
	} catch (e) {
		console.warn('error solicitarCambioPass!!', e)
	} finally {
		procesando.value = false
	}
}

async function validarCodigo() {
	try {
		const r = EncadenadorDeCodigo.safeParse(codigoSeparado.value)
		if (!r.success) {
			console.log('error', r.error)
			return
		}
		const codigo = r.data
		$consolo.log('validarCodigo', { codigo })
		procesando.value = true

		const { ok, error, intentosRestantes } = await $cuenta.cambiarPass.conCodigo(cuenta.email, codigo)
		$consolo.log('validarCodigo', { ok, error, intentosRestantes })

		if (!ok) {
			if (error === 'codigoInvalido') {
				if (intentosRestantes) {
					codigosIntentados.value.push(codigoSeparado.value)
				} else {
					modoActivo.value = 'demasiadosIntentos'
				}
			}
			if (error === 'operacionNoSolicitada') {
				codigosIntentados.value.splice(0)
				codigoSeparado.value = Array(4) as CodigoTupla
				modoActivo.value = 'solicitudInvalida'
			}
		} else {
			modoActivo.value = 'cambioExitoso'
		}
	} catch (e) {
		console.warn('error validarCodigo!!', e)
	} finally {
		procesando.value = false
	}
}

function ingresarPostCambioPass() {
	const { email, passNuevo } = cuenta
	emitir('ingresarConNuevoPass', { email, password: passNuevo })
}


function reintentar() {
	codigosIntentados.value.splice(0)
	codigoSeparado.value = Array(4) as CodigoTupla
	modoActivo.value = 'solicitarRecuPass'
}
</script>
<style lang="sass" scoped>
@import "~/sass/comun"
.recuPass
	width: 100%
	.formulario
		+saliendo
			overflow: hidden
			max-height: 100vh
		+salir
			max-height: 0
			opacity: 0

	.titulo
		margin-bottom: 2rem

	.accion
		margin-top: .5em
		border-top: 1px solid hsla(0,0%,50%, .2)
		padding-top: 1em
	a
		&.regresar
			display: block
			color: $acento

	.elIcono
		font-size: 5em
		margin: 1rem 0
		display: flex
		justify-content: center
</style>
