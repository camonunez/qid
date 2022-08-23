<template lang="pug">
.recuPass
	transition(mode="out-in" :duration="300")

		// Creación pass
		a-form-model.formulario(key="solicitarCambioPass"
			:model="cuenta"
			layout="vertical"
			ref="formCreacionPass"
			:rules="reglasCreacionPassword")


			a-form-model-item(prop="email" :label="$t('correo')")
				a-input(
					disabled
					:value="email"
					:placeholder="$t('correo')"
					type="email"
					autocomplete="off"
				)
					i-carbon-email

			a-form-model-item(prop="nuevoPass" :label="$t('nuevoPass')")

				a-input-password(
					ref="nuevoPass"
					v-model="cuenta.nuevoPass"
					:placeholder="$t('nuevoPass')"
					autocomplete="new-password"
					@keyup.enter="procesarCambioPass"
					)
					i-carbon-password

			.accion
				a-form-model-item
					a-button.enSesion.anchoComun(type="primary" block @click="procesarSolicitudCambioPass" :loading="procesando")
						| {{ procesando ? $t('enviandoSolicitud') : $t('cambiarPass') }}


</template>
<script>
export default {
	props: {
		email: { type: String, required: true, default: undefined }
	},
	data() {
		return {
			procesando: false,
			error: null,

			passIncorrectos: [],

			cuenta: {},

			reglasCreacionPassword: {
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
			this.$refs.formCreacionPass.validate(valid => {
				if (valid) {
					const c = this.cuenta
					this.solicitarCambioPass(c.nuevoPass)
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async solicitarCambioPass(passNuevo) {
			this.$consolo.log('solicitarCambioPass', { passNuevo })
			this.procesando = true
			const test = false
			if (test) {
				this.procesando = false
				return
			}
			try {
				const { ok, error } = await this.$cuenta.crearPass(passNuevo)
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
							this.$refs.formCreacionPass.validate()
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
