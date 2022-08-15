<template lang="pug">
.recuPass
	transition(mode="out-in" :duration="300")

		// CAMBIO PASSWORD
		a-form-model.formulario(key="solicitarReautenticacion"
			:model="cuenta"
			layout="vertical"
			ref="formCambioPass"
			:rules="reglasCambioPass")

			h1.titulo {{ $t('confirmaPass') }}

			.dn
				input(type="text" autocomplete="username" :value="$usuario.email" readonly)

			a-form-model-item(prop="pass"
				:help="_.get(error, 'pass')"
				:validateStatus="passIncorrectos.includes(cuenta.pass) ? 'error' : ''")

				.flex.f11.jcsb(slot="label")
					label {{$t('pass')}}
					n-link.passOlvidada(to="/cuenta/recuperar-pass") Olvidada?

				a-input-password(
					ref="actualpass"
					v-model="cuenta.pass"
					:placeholder="$t('pass')"
					autocomplete="current-password"
					@keyup.enter="procesarSolicitudCambioPass"
				)
					a-icon(slot="prefix" type="key")


			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="procesarSolicitudCambioPass" :loading="procesando")
						| {{ procesando ? $t('enviandoSolicitud') : $t('autenticar') }}


</template>
<script>
export default {
	props: {
		email: { type: String, required: false, default: undefined }
	},
	data() {
		const vm = this
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
					this.solicitarReautenticacion(c.pass)
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async solicitarReautenticacion(pass) {
			this.$consolo.log('solicitarReautenticacion', { pass })
			this.procesando = true
			const test = false
			if (test) {
				this.procesando = false
				return
			}
			try {
				const { ok, error } = await this.$cuenta.reautenticar(pass)
				this.procesando = false
				this.cuenta = Object.assign({}, this.cuenta, { codigo: '' })
				if (ok) {
					this.$message.success('Autenticación correcta')
					this.$emit('reautenticado')
				} else if (error) {
					if (error.pass === 'incorrecto') {
						this.$message.error('Contraseña incorrecta')
						this.passIncorrectos.push(this.cuenta.pass)
						this.$nextTick(() => {
							this.$refs.formCambioPass.validate()
						})
					} else {
						this.$message.error('No se autenticar')
						this.error = error
						console.warn('solicitarReautenticacion!! error', error)
					}
				}
			} catch (e) {
				console.warn('error solicitarReautenticacion!!', e)
				this.procesando = false
			}
		},

		pasarA(el) {
			el.focus()
		}
	},
	traducciones: {
		// FORMULARIO
		confirmaPass: { es: 'Confirma tu contraseña' },
		pass: { es: 'Contraseña' },
		enviandoSolicitud: { es: 'Enviando solicitud' },
		autenticar: { es: 'Confirmar' },

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
