<template lang="pug">
.recuPass
	transition(mode="out-in" :duration="300")

		// RECUPERACION PASSWORD
		a-form-model.formulario(v-if="modoActivo === 'solicitarRecuPass'" key="solicitarRecuPass"
			:model="cuenta"
			layout="vertical"
			ref="formRecuPass"
			:rules="reglasRecuPass")

			a.regresar.mb1rem(@click="$emit('volver')")
				a-icon(type="caret-left")
				span {{$t('volver')}}
			h1.titulo {{ $t('recuperaTuPass') }}

			a-form-model-item(prop="email"
					:label="$t('correo')")
				a-input(
					v-enfocar
					v-model="cuenta.email"
					:placeholder="$t('correo')"
					type="email"
					@keyup.enter="pasarA($refs.nPassword)"
					autocomplete="email"
					)
					a-icon(slot="prefix" type="mail")
			a-form-model-item(prop="password" :label="$t('nuevoPass')")
				a-input(
					ref="nPassword"
					v-model="cuenta.password"
					:placeholder="$t('nuevoPass')"
					type="password"
					autocomplete="new-password"
					@keyup.enter="procesarIngreso"
				)
					a-icon(slot="prefix" type="key")

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="procesarSolicitudCambioPass" :loading="procesando")
						| {{ procesando ? $t('enviandoSolicitud') : $t('cambiarPass') }}

		// CAMBIO DE PASSWORD CON CODIGO
		a-form-model.formulario(v-else-if="modoActivo === 'cambiarPassCodigo'" key="cambiarPassCodigo"
			:model="cuenta"
			layout="vertical"
			ref="formCambioPassCodigo"
			:rules="reglasCambioPassCodigo")

			a.regresar.mb1rem(@click="$emit('volver')")
				a-icon(type="caret-left")
				span {{$t('volver')}}
			h1.titulo {{ $t('codigoEnviadoAEmail') }}
			p {{$t('ingresaloParaConfirmar')}}
			//- p cuenta.codigo {{cuenta.codigo}} typeof: {{typeof cuenta.codigo}}

			a-form-model-item.formItemCodigo(prop="codigoSeparado" :label="$t('codigoConfirmacion')")
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
					//- a-icon(slot="prefix" type="key")

			a-form-model-item.formItemCode(prop="codigo")

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="$refs.formCambioPassCodigo.validate()" :disabled="codigosIntentados.includes(cuenta.codigo)" :loading="procesando")
						| {{ procesando ? $t('validando') : $t('confirmarCambioPass') }}

		// PASS CAMBIADO
		a-form-model.formulario(v-else-if="modoActivo === 'cambioExitoso'" key="cambioExitoso"
			:model="cuenta"
			layout="vertical")

			.elIcono.exitoColor
				.oicono.circulo-check.m
			h1.titulo.tac {{ $t('hasCambiadoPass') }}

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="ingresarPostCambioPass")
						| {{ $t('ingresarAMiCuenta') }}

		// NO QUEDAN INTENTOS
		a-form-model.formulario(v-else-if="modoActivo === 'demasiadosIntentos'" key="demasiadosIntentos"
			:model="cuenta"
			layout="vertical")

			.elIcono
				.oicono.circulo-cruz.m
			h1.titulo.tac {{ $t('demasiadosIntentos') }}

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="reintentar")
						| {{ $t('reintentar') }}

		// SOLICITUD INVALIDA
		a-form-model.formulario(v-else-if="modoActivo === 'solicitudInvalida'" key="solicitudInvalida"
			:model="cuenta"
			layout="vertical")

			.elIcono
				.oicono.circulo-cruz.m
			h1.titulo.tac {{ $t('solicitudInvalida') }}

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="reintentar")
						| {{ $t('reintentar') }}

</template>
<script>
export default {
	name: 'RecuPass',
	directives: {
		enfocar: {
			inserted(el) {
				el.focus()
			}
		}
	},
	props: {
		email: { type: String, required: false, default: undefined }
	},
	data() {
		const vm = this
		return {
			modoActivo: 'solicitarRecuPass',
			// modoActivo: 'cambioExitoso',
			procesando: false,
			error: null,

			codigoSeparado: ['', '', '', ''],
			codigosIntentados: [],

			cuenta: {},

			reglasRecuPass: {
				email: [
					{ type: 'email', message: this.$t('emailInvalido') },
					{ required: true, message: this.$t('ingresaTuEmail') }
				],
				password: [
					{ required: true, message: this.$t('noOlvidesEsto') },
					{ type: 'string', min: 6, message: this.$t('muyCorto') }
				]
			},
			reglasCambioPassCodigo: {
				codigo: [
					{ required: true, message: this.$t('noOlvidesEsto') },
					{ type: 'string', min: 4, message: this.$t('muyCorto') },
					{ type: 'string', max: 4, message: this.$t('muyLargo') },
					{ validator: vm.validarCodigo }
				]
			}
		}
	},
	watch: {
		codigoSeparado: {
			deep: true,
			handler(v) {
				console.log('watcher codigoSeparado', v)
				this.cuenta = Object.assign({}, this.cuenta, { codigo: v.join('') })
				if (v.join('').length === 4) {
					this.$nextTick(() => {
						this.$refs.formCambioPassCodigo.validate()
					})
				}
			}
		}
	},
	mounted() {
		if (this.email) this.cuenta = { email: this.email }
	},
	methods: {
		procesarSolicitudCambioPass() {
			console.log('procesarSolicitudCambioPass')
			this.$refs.formRecuPass.validate(valid => {
				if (valid) {
					const c = this.cuenta
					this.solicitarCambioPass(c.email, c.password)
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async solicitarCambioPass(email, passNuevo) {
			this.$consolo.log('solicitarCambioPass', { email, passNuevo })
			this.procesando = true
			const test = false
			if (test) {
				this.procesando = false
				this.modoActivo = 'cambiarPassCodigo'
				return
			}
			try {
				const r = await this.$cuenta.cambiarPass.pedirCodigo(email, passNuevo)
				this.procesando = false
				this.codigosIntentados = []
				this.codigoSeparado = ['', '', '', '']
				this.cuenta = Object.assign({}, this.cuenta, { codigo: '' })
				if (!r.ok) {
					if (r.error) this.$message.error(r.error)
					return
				}
				this.modoActivo = 'cambiarPassCodigo'
			} catch (e) {
				console.warn('error solicitarCambioPass!!', e)
				this.procesando = false
			}
		},

		async validarCodigo(_rule, codigo, cb) {
			this.$consolo.log('validarCodigo', { codigo })
			const c = this.cuenta

			this.procesando = true

			const { ok, error, intentosRestantes } = await this.$cuenta.cambiarPass.conCodigo(c.email, codigo)
			this.$consolo.log('validarCodigo', { ok, error, intentosRestantes })

			this.procesando = false
			if (!ok) {
				if (error === 'codigoInvalido') {
					if (intentosRestantes) {
						this.codigosIntentados.push(codigo)
					} else {
						this.modoActivo = 'demasiadosIntentos'
					}
				}
				if (error === 'operacionNoSolicitada') {
					this.codigosIntentados = []
					this.codigoSeparado = ['', '', '', '']
					this.cuenta = { codigo: '' }
					this.modoActivo = 'solicitudInvalida'
				}
				cb(this.$t(error))
			} else {
				this.modoActivo = 'cambioExitoso'
				cb()
			}
		},

		pasarA(el) {
			el.focus()
		},

		soloNumeros(event) {
			const { key, code } = event
			console.log('soloNumeros', { key, code })
			const esNumero = !isNaN(Number(key))
			if (!esNumero) {
				event.preventDefault()
			}
		},

		moverCursor(event, elAntes, elDespues) {
			const { key } = event
			// console.log('moverCursor', { key, code, elAntes: !!elAntes, elDespues: !!elDespues })
			const keysAtras = ['Backspace', 'ArrowLeft']
			const keysAdelante = ['Tab', 'ArrowRight']
			const esNumero = !isNaN(Number(key))
			if (elAntes && keysAtras.includes(key)) {
				// console.log('atras', elAntes)
				elAntes.focus()
			} else if (elDespues && (keysAdelante.includes(key) || esNumero)) {
				// console.log('adelante', elDespues)
				elDespues.focus()
			}
		},
		pegarCodigo(event) {
			const pegado = event.clipboardData.getData('text')
			const limpio = pegado.replace(/-+/g, '').replace(/_+/g, '').replace(/[^\d]/g, '')
			const codigo = limpio.slice(0, 4)
			console.log('pegarCodigo', { codigo, limpio, pegado })
			this.codigoSeparado = [...codigo]
		},

		ingresarPostCambioPass() {
			const { email, password } = this.cuenta
			this.$emit('ingresarConNuevoPass', { email, password })
		},
		reintentar() {
			this.codigosIntentados = []
			this.codigoSeparado = ['', '', '', '']
			this.cuenta = { codigo: '' }
			this.modoActivo = 'solicitarRecuPass'
		}
	},
	traducciones: {
		// FORMULARIO
		correo: { es: 'Correo' },
		volver: { es: 'Volver' },
		recuperaTuPass: { es: 'Reestablece tu contraseña' },
		nuevoPass: { es: 'Nueva contraseña' },
		enviandoSolicitud: { es: 'Enviando solicitud' },
		cambiarPass: { es: 'Cambiar contraseña' },
		codigoEnviadoAEmail: { es: 'Te enviamos un código' },
		ingresaloParaConfirmar: {
			es: 'Ingrésalo para confirmar el cambio de contraseña'
		},
		codigoConfirmacion: { es: 'Código de confirmacion' },
		validando: { es: 'Validando' },
		// acciones
		confirmarCambioPass: { es: 'Confirmar cambio' },
		operacionNoSolicitada: { es: 'Operación no solicitada' },

		// VALIDACION
		// ingreso
		emailInvalido: { es: 'E-mail inválido' },
		ingresaTuEmail: { es: 'Ingresa tu e-mail' },
		muyCorto: { es: 'Muy corto' },
		muyLargo: { es: 'Muy largo' },
		// registro
		noOlvidesEsto: { es: 'No olvides esto' },

		// EXITO
		hasCambiadoPass: { es: 'Contraseña guardada!' },
		ingresarAMiCuenta: { es: 'Ingresar a mi cuenta' },
		// FRACASO
		codigoInvalido: { es: 'Código inválido' },
		demasiadosIntentos: { es: 'Demasiados intentos' },
		reintentar: { es: 'Reintentar' }
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
		::v-deep .ant-form-item
			&:last-child
				margin-bottom: 0

	a
		&.regresar
			display: block
			color: $acento
	.formItemCodigo
		::v-deep .ant-form-item-children
			display: flex
			width: 100%

			.codigo
				display: block
				margin: 0 .5em
				text-align: center

	.elIcono
		font-size: 5em
		margin: 1rem 0
		display: flex
		justify-content: center
</style>
