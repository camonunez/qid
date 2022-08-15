<template lang="pug">
.recuPass
	transition(mode="out-in" :duration="300")

		// CAMBIO PASSWORD
		a-form-model.formulario(key="solicitarCambioPass"
			:model="cuenta"
			layout="vertical"
			ref="formCambioPass"
			:rules="reglasCambioPass")

			h1.titulo {{ $t('cambiaTuPass') }}

			.dn
				input(type="text" autocomplete="username" :value="$usuario.email" readonly)

			a-form-model-item(prop="pass"
				:help="_.get(error, 'pass')"
				:validateStatus="passIncorrectos.includes(cuenta.pass) ? 'error' : ''")

				.flex.f11.jcsb(slot="label")
					label {{$t('actualPass')}}
					n-link.passOlvidada(to="/cuenta/recuperar-pass") Olvidada?

				a-input-password(
					ref="actualpass"
					v-model="cuenta.pass"
					:placeholder="$t('contrasena')"
					autocomplete="current-password"
					@keyup.enter="pasarA($refs.nuevoPass)"
				)
					a-icon(slot="prefix" type="key")

			a-form-model-item(prop="nuevoPass" :label="$t('nuevoPass')")

				a-input-password(
					ref="nuevoPass"
					v-model="cuenta.nuevoPass"
					:placeholder="$t('nuevoPass')"
					autocomplete="new-password"
					@keyup.enter="procesarCambioPass"
					)
					a-icon(slot="prefix" type="key")

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="procesarSolicitudCambioPass" :loading="procesando")
						| {{ procesando ? $t('enviandoSolicitud') : $t('cambiarPass') }}


</template>
<script>
export default {
	props: {
		email: { type: String, required: false, default: undefined }
	},
	data() {
		const vm = this

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const validatePass = (_rule, value, callback) => {
			if (vm.passIncorrectos.includes(value)) {
				callback(new Error('Contraseña incorrecta'))
			} else {
				callback()
			}
		}

		return {
			procesando: false,
			error: null,

			passIncorrectos: [],

			cuenta: {},

			reglasCambioPass: {
				pass: [
					{ required: true, message: this.$t('noOlvidesEsto') },
					{ type: 'string', min: 1, message: this.$t('muyCorto') },
					{ validator: validatePass, trigger: 'change' }
				],
				nuevoPass: [
					{ required: true, message: this.$t('noOlvidesEsto') },
					{ type: 'string', min: 8, message: this.$t('muyCorto') }
				]
			}
		}
	},
	methods: {
		procesarSolicitudCambioPass() {
			console.log('procesarSolicitudCambioPass')
			this.$refs.formCambioPass.validate(valid => {
				if (valid) {
					const c = this.cuenta
					this.solicitarCambioPass(c.pass, c.nuevoPass)
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async solicitarCambioPass(pass, passNuevo) {
			this.$consolo.log('solicitarCambioPass', { pass, passNuevo })
			this.procesando = true
			const test = false
			if (test) {
				this.procesando = false
				return
			}
			try {
				const { ok, error } = await this.$cuenta.cambiarPass.conPass(pass, passNuevo)
				this.procesando = false
				this.codigosIntentados = []
				this.codigoSeparado = ['', '', '', '']
				this.cuenta = Object.assign({}, this.cuenta, { codigo: '' })
				if (ok) {
					this.$message.success('Contraseña cambiada')
					this.$emit('passCambiado')
				} else if (error) {
					if (error.pass === 'incorrecto') {
						this.$message.error('Contraseña actual incorrecta')
						this.passIncorrectos.push(this.cuenta.pass)
						this.$nextTick(() => {
							this.$refs.formCambioPass.validate()
						})
					} else {
						this.$message.error('No se pudo cambiar la contraseña')
						this.error = error
						console.warn('solicitarCambioPass!! error', error)
					}
				}
			} catch (e) {
				console.warn('error solicitarCambioPass!!', e)
				this.procesando = false
			}
		},

		pasarA(el) {
			el.focus()
		}
	},
	traducciones: {
		// FORMULARIO
		cambiaTuPass: { es: 'Cambia tu contraseña' },
		actualPass: { es: 'Contraseña actual' },
		nuevoPass: { es: 'Nueva contraseña' },
		enviandoSolicitud: { es: 'Enviando solicitud' },
		cambiarPass: { es: 'Cambiar contraseña' },

		// VALIDACION
		// ingreso
		muyCorto: { es: 'Muy corto' },
		// registro
		noOlvidesEsto: { es: 'No olvides esto' },

		// EXITO
		hasCambiadoPass: { es: 'Contraseña guardada!' },
		// FRACASO
		demasiadosIntentos: { es: 'Demasiados intentos' }
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
		+fwb

	::v-deep
		// .ant-form-item-label
		.ant-form-item-required
			display: flex
			width: 100%
</style>
