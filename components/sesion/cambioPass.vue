<template lang="pug">
.recuPass
	transition(mode="out-in" :duration="300")

		// CAMBIO PASSWORD
		form.formulario(key="solicitarCambioPass")

			h1.titulo {{ i18n('cambiaTuPass') }}

			.dn
				input(type="text" autocomplete="username" :value="$usuario.email" readonly)

			.formElemento

				.flex.f11.jcsb(slot="label")
					label {{ i18n('actualPass') }}
					n-link.passOlvidada(to="/cuenta/recuperar-pass") Olvidada?

				//- a-input-password(
				//- 	ref="actualpass"
				//- 	v-model="cuenta.password"
				//- 	:placeholder="i18n('contrasena')"
				//- 	autocomplete="current-password"
				//- 	@keyup.enter="campoPassNuevo && campoPassNuevo.focus()"
				//- )
				//- 	i-carbon-password


				UiInput(ref="campoPassActual" 
				v-model="cuenta.password" 
				:etiqueta="i18n('actualPass')"
				:placeholder="i18n('actualPass')"
				:type="mostrarPass ? 'text' : 'password'"
				autocomplete="current-password")
					template(v-slot:preIcono)
						i-carbon-password
					template(v-slot:postIcono)
						i-carbon-view(v-if="mostrarPass" @click="mostrarPass = false")
						i-carbon-view-off(v-else @click="mostrarPass = true")

			.formElemento(prop="passwordNuevo" :label="i18n('passwordNuevo')")

				//- a-input-password(
				//- 	ref="passwordNuevo"
				//- 	v-model="cuenta.passwordNuevo"
				//- 	:placeholder="i18n('passwordNuevo')"
				//- 	autocomplete="new-password"
				//- 	@keyup.enter="solicitarCambioPass"
				//- 	)
				//- 	i-carbon-password

				UiInput(ref="campoPassActual" 
				v-model="cuenta.password" 
				:etiqueta="i18n('passwordNuevo')"
				:placeholder="i18n('passwordNuevo')"
				:type="mostrarNuevoPass ? 'text' : 'password'"
				autocomplete="new-password")
					template(v-slot:preIcono)
						i-carbon-password
					template(v-slot:postIcono)
						i-carbon-view-off(v-if="mostrarNuevoPass" @click="mostrarNuevoPass = false")
						i-carbon-view(v-else @click="mostrarNuevoPass = true")
			.accion
				.formElemento
					button.boton.primario.enSesion.anchoComun(block @click="solicitarCambioPass" :loading="procesando")
						| {{ procesando ? i18n('enviandoSolicitud') : i18n('cambiarPass') }}


</template>
<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { z } from 'zod'
// import { rosetta } from '~/plugins/i18n'

// import { rosetta } from '~/plugins/i18n'
const { $usuario, $consolo, $cuenta } = useNuxtApp()

const { $rosetta } = useNuxtApp()
// Traducciones
const i18n = $rosetta({
	// FORMULARIO
	cambiaTuPass: {
		es: 'Cambia tu contraseña',
		en: 'Change your password'
	},
	actualPass: {
		es: 'Contraseña actual',
		en: 'Current password'
	},
	passwordNuevo: {
		es: 'Nueva contraseña'
	},
	enviandoSolicitud: {
		es: 'Enviando solicitud'
	},
	cambiarPass: {
		es: 'Cambiar contraseña'
	},

	// VALIDACION
	// ingreso
	muyCorto: {
		es: 'Muy corto'
	},
	// registro
	noOlvidesEsto: {
		es: 'No olvides esto'
	},

	// EXITO
	hasCambiadoPass: {
		es: 'Contraseña guardada!'
	},
	// FRACASO
	demasiadosIntentos: {
		es: 'Demasiados intentos'
	}
})

// Refs
const formCambioPass = ref<HTMLInputElement | null>(null)
const campoPassNuevo = ref<HTMLInputElement | null>(null)
const campoPassActual = ref<HTMLInputElement | null>(null)

// Props
const { email } = defineProps<{
	email: string
}>()

// Data
const cuenta = reactive({
	// email: '',
	password: '',
	passwordNuevo: ''
})

const procesando = ref<boolean>(false)
const mostrarPass = ref<boolean>(false)
const mostrarNuevoPass = ref<boolean>(true)
const passIncorrectos = reactive<string[]>([])
const codigosIntentados = reactive<string[]>([])

const Email = z.string().email({ message: i18n('emailInvalido') })
const CambioPass = z.object({
	password: z.string({
		required_error: i18n('noOlvidesEsto'),
	}).min(6, { message: i18n('muyCorto') }),
	passwordNuevo: z.string().min(8, { message: i18n('muyCorto') })
})

// Events

const emitir = defineEmits(['passCambiado'])

// Methods
async function solicitarCambioPass() {
	try {
		const r = CambioPass.safeParse(cuenta)
		if (!r.success) {
			console.log('error', r.error)
			return
		}
		const { password, passwordNuevo } = r.data
		$consolo.log('solicitarCambioPass', { password, passwordNuevo })

		const { ok, error } = await $cuenta.cambiarPass.conPass(password, passwordNuevo)

		procesando.value = false
		if (!ok && error) {
			if (error.pass === 'incorrecto') {
				// $message.error('Contraseña actual incorrecta')
				passIncorrectos.push(cuenta.password)
			} else {
				// $message.error('No se pudo cambiar la contraseña')
				// error = error
				console.warn('solicitarCambioPass!! error', error)
			}
			return
		}
		// $message.success('Contraseña cambiada')
		emitir('passCambiado')
		codigosIntentados.splice(0)
		cuenta.password = ''
		cuenta.passwordNuevo = ''
	} catch (e) {
		console.warn('error solicitarCambioPass!!', e)
	} finally {
		procesando.value = false
	}
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
		+fwb

</style>
