<template lang="pug">
.rootFormIngreso
	transition(mode="out-in" :duration="300")

		SesionUsuarioConectado.usuarioConectado(v-if="$usuario" key="conectado")

		// INGRESO
		form.formIngreso.anchoComun(v-else-if="modoActivo === 'ingreso'" key="ingreso" ref="formIngreso")

			h1.titulo {{ i18n('ingresaATuCuenta') }}

			.formElemento.mb2rem

				UiInput(vFocus v-model="cuenta.email" :etiqueta="i18n('correo')" :placeholder="i18n('correo')" type="email" autocomplete="email" @keyup.enter="campoPassIngreso && campoPassIngreso.focus")
					template(#preIcono)
						i-carbon-email

			.formElemento

				UiInput(ref="campoPassIngreso"
					v-model="cuenta.password" :etiqueta="i18n('contrasena')" :placeholder="i18n('contrasena')" :type="mostrarPass ? 'text' : 'password'" autocomplete="current-password")
					template(#etiqueta)
						.flex.jcsb.aic
							span {{i18n('contrasena')}}
							a.passOlvidada.cp(@click="modoActivo = 'recuperarPass'") Olvidada?

					template(#preIcono)
						i-carbon-password
					template(#postIcono)
						.clickable
							i-carbon-view(v-if="mostrarPass" @click="mostrarPass = false")
							i-carbon-view-off(v-else @click="mostrarPass = true")

			.accion

				//- div.flex.jcsb(slot="label")
					//- label {{i18n('contrasena')}}
					a.passOlvidada(@click="modoActivo = 'recuperarPass'") Olvidada?
					
				.formElemento.mt1rem
					button.boton.primario.anchoComun(
						@click.prevent="ingresar"
						:loading="conectando"
						icon="login"
						:disabled="passIncorrectos.includes(cuenta.password)"
						) {{ conectando ? i18n('conectando') : i18n('ingresar') }}

				//- .a-form-model-item
					.cambioModo
						| {{i18n('eresNuevo')}}
						a(@click="modoActivo = 'registro'") {{" "}}{{i18n('registrate')}}

					//a.passOlvidada(@click="modoActivo = 'recuperarPass'") Olvidada?
					//.a-form-model-item
						.cambioModo
							a(@click="modoActivo = 'recuperarPass'") No tienes u olvidaste tu contraseña?



		// REGISTRO
		.formRegistro(v-else-if="modoActivo === 'registro'" key="registro"
			:model="cuenta"
			layout="vertical"
			ref="formRegistro"
			:rules="reglasRegistro")

			h1.titulo {{ i18n('creaTuCuenta') }}

			.grupoCampos

				.formElemento
					//- input(v-focus v-model="cuenta.nombre" :placeholder="i18n('nombre')" autocomplete="given-name")
					UiInput(vFocus v-model="cuenta.nombre" :etiqueta="i18n('nombre')" :placeholder="i18n('nombre')" autocomplete="given-name" @keyup.enter="campoPassIngreso && campoPassIngreso.focus")
						//- template(#preIcono)
							i-carbon-email

				.formElemento
					//- input(v-model="cuenta.apellido" :placeholder="i18n('apellido')" autocomplete="family-name")
					UiInput(vFocus v-model="cuenta.apellido" :etiqueta="i18n('apellido')" :placeholder="i18n('apellido')" autocomplete="family-name" @keyup.enter="campoPassIngreso && campoPassIngreso.focus")
						//- template(#preIcono)
							i-carbon-email


			.formElemento
				UiInput(vFocus v-model="cuenta.email" :etiqueta="i18n('correo')" :placeholder="i18n('correo')" type="email" autocomplete="username" @keyup.enter="campoPassIngreso && campoPassIngreso.focus")
					template(#preIcono)
						i-carbon-email

			.formElemento

				UiInput(ref="campoPassRegistro"
					v-model="cuenta.password" :etiqueta="i18n('contrasena')" :placeholder="i18n('contrasena')" :type="mostrarPass ? 'text' : 'password'" autocomplete="new-password")
					template(#preIcono)
						i-carbon-password
					template(#postIcono)
						i-carbon-view(v-if="mostrarPass" @click="mostrarPass = false")
						i-carbon-view-off(v-else @click="mostrarPass = true")

			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(@click="registrar" :loading="conectando")
						| {{ conectando ? i18n('creandoCuenta') : i18n('crearla') }}
				.formElemento
					.cambioModo
						| {{ i18n('yaTienes') }}
						a(@click="modoActivo = 'ingreso'") {{ " " }}{{ i18n('ingresa') }}


		// RECUPERACION PASSWORD
		SesionRecuPass.laRecuPass(v-else-if="modoActivo === 'recuperarPass'" key="recuperarPass"
			:email="cuenta.email"
			@volver="modoActivo = 'ingreso'"
			@ingresarConNuevoPass="ingresar")


	//- .sinConexion.flex.aic(v-if="$inConexion" @click="$cuentaAPI.ping()")
	//- 	.oicono.enchufe.m
	//- 	.texto {{i18n('errorDeRed')}}
</template>
<script setup lang="ts">
import { useNuxtApp } from 'nuxt/app'
import { ref, reactive, computed, watch } from 'vue'

import { rosetta } from '@/plugins/i18n'
import { z } from 'zod'

// Plugins
const { $usuario, $consolo, $cuentaAPI } = useNuxtApp()

// i18n
const i18n = rosetta({
	// FORMULARIO
	// ingreso
	ingresaATuCuenta: {
		es: 'Ingresa a tu cuenta',
		en: 'Sign in to your account'
	},
	correo: {
		es: 'Correo',
		en: 'Email'
	},
	contrasena: {
		es: 'Contraseña',
		en: 'Password'
	},
	conectando: {
		es: 'Conectando',
		en: 'Connecting'
	},
	ingresar: {
		es: 'Ingresar',
		en: 'Sign in'
	},
	passIncorrecto: {
		es: 'Incorrecto',
		en: 'Incorrect'
	},
	correoNoRegistrado: {
		es: 'Correo no registrado',
		en: 'Email not registered'
	},
	emailSinCuenta: {
		es: 'El email ingresado no tiene cuenta',
		en: 'The email entered does not have an account'
	},
	// registro
	creaTuCuenta: {
		es: 'Crea tu cuenta',
		en: 'Create your account'
	},
	nombre: {
		es: 'Nombre',
		en: 'Name'
	},
	apellido: {
		es: 'Apellido',
		en: 'Last name'
	},
	creandoCuenta: {
		es: 'Creando cuenta',
		en: 'Creating account'
	},
	crearla: {
		es: 'Crearla',
		en: 'Create it'
	},

	// acciones
	yaTienes: {
		es: 'Ya tienes una cuenta?',
		en: 'Already have an account?'
	},
	ingresa: {
		es: 'Ingresa',
		en: 'Sign in'
	},
	eresNuevo: {
		es: 'Eres nuevo aquí?',
		en: 'Are you new here?'
	},
	cancelar: {
		es: 'Cancelar',
		en: 'Cancel'
	},
	registrate: {
		es: 'Regístrate',
		en: 'Register'
	},
	registrarme: {
		es: 'Registrarme',
		en: 'Register me'
	},
	confirmarCambioPass: {
		es: 'Confirmar cambio',
		en: 'Confirm change'
	},
	operacionNoSolicitada: {
		es: 'Operación no solicitada',
		en: 'Operation not requested'
	},

	// VALIDACION
	falta: {
		es: 'Falta',
		en: 'Missing'
	},
	// ingreso
	emailInvalido: {
		es: 'E-mail inválido',
		en: 'Invalid email'
	},
	ingresaTuEmail: {
		es: 'Ingresa tu e-mail',
		en: 'Enter your email'
	},
	muyCorto: {
		es: 'Muy corto',
		en: 'Too short'
	},
	// registro
	nombreInvalido: {
		es: 'Nombre inválido',
		en: 'Invalid name'
	},
	apellidoInvalido: {
		es: 'Apellido inválido',
		en: 'Invalid surname'
	},
	noOlvidesEsto: {
		es: 'No olvides esto',
		en: "Don't forget this"
	},

	errorDeRed: { es: 'Error de red', en: 'Network error', pt: 'Error de red' }
})

// Props
const { modo = 'ingreso' } = defineProps<{
	modo?: 'ingreso' | 'registro' | 'recuperarPass'
}>()

// Refs
const campoPassIngreso = ref<HTMLInputElement | null>(null)

// Data
let modoActivo = ref(modo)
let mostrarPass = ref<boolean>(false)
let conectando = ref<boolean>(false)
const cuenta = reactive({
	// nombre: '',
	// apellido: '',
	// email: '',
	// password: '',
	// confirmacion: '',

	email: 'contador@pow.cl',
	password: 'walalala',
	confirmacion: 'walalala',
	nombre: 'Contador',
	apellido: 'Contador'
})

const emailsNoExistentes = reactive<string[]>([])
const passIncorrectos = reactive<string[]>([])

const Email = z.string().email({})
const Ingreso = z.object({
	email: Email,
	password: z.string().min(6)
})

type Ingreso = z.infer<typeof Ingreso>

const Registro = z.object({
	nombre: z.string({
		required_error: 'Name is required',
		invalid_type_error: 'Name must be a string'
	}),
	apellido: z.string(),
	email: Email,
	password: z.string().min(6)
})

type Registro = z.infer<typeof Registro>

const reglasIngreso = {
	email: [
		{ type: 'email', message: i18n('emailInvalido'), trigger: 'blur' },
		{ required: true, message: i18n('ingresaTuEmail') }
	],
	password: [
		{
			required: true,
			message: i18n('noOlvidesEsto'),
			trigger: 'blur'
		},
		{
			type: 'string',
			min: 1,
			message: i18n('muyCorto'),
			trigger: 'blur'
		}
	]
}

const reglasRegistro = {
	nombre: [{ required: true, message: '*', whitespace: true }],
	apellido: [{ required: true, message: '*', whitespace: true }],

	email: [
		{ type: 'email', message: i18n('emailInvalido'), trigger: 'blur' },
		{ required: true, message: i18n('ingresaTuEmail') }
	],
	password: [
		{
			required: true,
			message: i18n('noOlvidesEsto'),
			trigger: 'blur'
		},
		{
			type: 'string',
			min: 1,
			message: i18n('muyCorto'),
			trigger: 'blur'
		}
	]
}

// Watchers

watch(
	computed(() => cuenta.email),
	() => {
		// emailsNoExistentes.splice(0)
		passIncorrectos.splice(0)
	}
)

// Methods
function enfocarEn(el: HTMLElement | null) {
	el && el.focus()
}

async function ingresar() {
	const fx = 'ingresar'
	try {
		const r = Ingreso.safeParse(cuenta)
		if (!r.success) {
			console.log(fx, 'error', r.error)
			return false
		}
		console.log(fx, 'pasó')
		const { email, password } = r.data
		console.log('ingresar', { email, password })
		conectando.value = true
		const s = await $cuentaAPI.ingresar(email, password)
		$consolo.log('r', s)

		if (!s.ok) {
			// tratarErrorDeIngreso(r.error)
			console.error(r)
		}
	} catch (e) {
		console.error('caught', e)
		// } finally {
		// 	conectando.value = false
	}
}

// function tratarErrorDeIngreso(error) {
// 	console.log('tratarErrorDeIngreso')
// 	const r = Ingreso.safeParse(cuenta)
// 	if (!r.success) {
// 		console.log('error', r.error)
// 		return
// 	}
// 	ingresar(r.data)
// 	return r.data
// }

async function registrar() {
	try {
		const r = Registro.safeParse(cuenta)
		if (!r.success) {
			console.log('error', r.error)
			return false
		}
		conectando.value = true
		const { nombre, apellido, email, password } = r.data
		$consolo.log('registrar', { nombre, apellido, email, password })
		await $cuentaAPI.crearCuenta(nombre, apellido, email, password)
	} catch (e) {
		$consolo.error('registrar', e)
	} finally {
		conectando.value = false
	}
}

function resetRegistro() {
	cuenta.nombre = ''
	cuenta.apellido = ''
	cuenta.email = ''
	cuenta.password = ''
	cuenta.confirmacion = ''
}
</script>
<style lang="sass" scoped>
@import "~/sass/comun"
.rootFormIngreso
	width: 100%
	max-width: 100%
	position: relative
	.formIngreso,
	.formRegistro,
	.usuarioConectado,
	.laRecuPass
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

	.cambioModo
		display: block
		margin-top: 2em
		text-align: center

	a
		color: $acento
		+fwm

	.grupoCampos
		display: flex
		> div
			&:first-child
				input
					border-top-right-radius: 0
					border-bottom-right-radius: 0
			&:last-child
				input
					border-top-left-radius: 0
					border-bottom-left-radius: 0



.rootFormIngreso
	input:-webkit-autofill,
	input:-webkit-autofill:hover,
	input:-webkit-autofill:focus,
	textarea:-webkit-autofill,
	textarea:-webkit-autofill:hover,
	textarea:-webkit-autofill:focus,
	select:-webkit-autofill,
	select:-webkit-autofill:hover,
	select:-webkit-autofill:focus
		// border: 1px solid green
		background-color: #000
		-webkit-text-fill-color: $claro
		color: $medioOscuro

		-webkit-box-shadow: 0 0 0px 1000px darken($atencion, 60%) inset
		transition: background-color 5000s ease-in-out 0s
</style>
