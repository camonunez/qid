<template lang="pug">
.rootFormIngreso
	transition(mode="out-in" :duration="300")

		SesionUsuarioConectado.usuarioConectado(v-if="$usuario" key="conectado")

		// INGRESO
		.formIngreso(v-else-if="modoActivo === 'ingreso'" key="ingreso"
			:model="cuenta"
			layout="vertical"
			ref="formIngreso"
			:rules="reglasIngreso")

			h1.titulo {{ $t('ingresaATuCuenta') }}

			.formElemento(prop="email" :label="$t('correo')"
				:help="emailsNoExistentes.includes(cuenta.email) ? 'No registrado' : ''"
				:validateStatus="emailsNoExistentes.includes(cuenta.email) ? 'error' : ''")
				input(
					v-enfocar
					v-model="cuenta.email"
					:placeholder="$t('correo')"
					type="email"
					@keyup.enter="pasarA($refs.iPassword)"
					autocomplete="email"
				)
				.icono.m.correo

			.formElemento(prop="password"
				:help="passIncorrectos.includes(cuenta.password) ? $t('passIncorrecto') : ''"
				:validateStatus="passIncorrectos.includes(cuenta.password) ? 'error' : ''")

				//- div.flex.jcsb(slot="label")
					label {{$t('contrasena')}}
					a.passOlvidada(@click="modoActivo = 'recuperarPass'") Olvidada?

				a-input-password(
					ref="iPassword"
					v-model="cuenta.password"
					:placeholder="$t('contrasena')"
					autocomplete="password"
					@keyup.enter="procesarIngreso"
				)
				.icono.m.llave

			.accion
				a-form-model-item
					a-button.anchoComun(type="primary" block
						@click="procesarIngreso"
						:loading="conectando"
						icon="login"
						:disabled="passIncorrectos.includes(cuenta.password)"
						) {{ conectando ? $t('conectando') : $t('ingresar') }}
				
				//- a-form-model-item
					.cambioModo
						| {{$t('eresNuevo')}}
						a(@click="modoActivo = 'registro'") {{" "}}{{$t('registrate')}}

					//a.passOlvidada(@click="modoActivo = 'recuperarPass'") Olvidada?
				//a-form-model-item
					.cambioModo
						a(@click="modoActivo = 'recuperarPass'") No tienes u olvidaste tu contraseña?



		// REGISTRO
		.formRegistro(v-else-if="modoActivo === 'registro'" key="registro"
			:model="cuenta"
			layout="vertical"
			ref="formRegistro"
			:rules="reglasRegistro")

			h1.titulo {{ $t('creaTuCuenta') }}

			.grupoCampos

				.formElemento(prop="nombre" :label="$t('nombre')")
					input(v-enfocar v-model="cuenta.nombre" :placeholder="$t('nombre')" autocomplete="given-name")

				.formElemento(prop="apellido" :label="$t('apellido')")
					input(v-model="cuenta.apellido" :placeholder="$t('apellido')" autocomplete="family-name")

			.formElemento(prop="email" :label="$t('correo')")
				input(v-model="cuenta.email" :placeholder="$t('correo')" type="email" autocomplete="email")
				.icono.m.mail

			.formElemento(prop="password" :label="$t('contrasena')")
				input(type="password"
					v-model="cuenta.password" 
					:placeholder="$t('contrasena')"
					autocomplete="new-password")
				.icono.m.llave

			.accion
				.formElemento
					a-button.enSesion.anchoComun(type="primary" @click="procesarRegistro" :loading="conectando")
						| {{ conectando ? $t('creandoCuenta') : $t('crearla') }}
				.formElemento
					.cambioModo
						| {{$t('yaTienes')}}
						a(@click="modoActivo = 'ingreso'") {{" "}}{{$t('ingresa')}}


		// RECUPERACION PASSWORD
		SesionRecuPass.laRecuPass(v-else-if="modoActivo === 'recuperarPass'" key="recuperarPass"
			:email="cuenta.email"
			@volver="modoActivo = 'ingreso'"
			@ingresarConNuevoPass="ingresar")


	//- .sinConexion.flex.aic(v-if="$inConexion" @click="$cuenta.ping()")
	//- 	.oicono.enchufe.m
	//- 	.texto {{$t('errorDeRed')}}
</template>
<script setup>
const { $usuario } = useNuxtApp()

</script>
<script>
export default {
	name: 'Ingreso',
	directives: {
		enfocar: {
			inserted(el) {
				el.focus()
			}
		}
	},
	props: {
		modo: { type: String, required: false, default: 'ingreso' }
	},
	data() {
		// console.log('IGRESO DATA this.modo', this.modo)

		let modoActivo = 'ingreso'
		if (this.modo && 'ingreso registro'.split(' ').includes(this.modo)) {
			modoActivo = this.modo
		}

		const cuenta = {
			nombre: '',
			apellido: '',
			email: '',
			password: '',
			confirmacion: ''
		}

		return {
			modoActivo,
			// modoActivo: 'recuperarPass',
			conectando: false,
			error: null,

			// cuenta: { nombre: '', apellido: '', email: '', password: '', confirmacion: '' },
			cuenta,

			emailsNoExistentes: [],
			passIncorrectos: []
		}
	},
	computed: {
		reglasIngreso() {
			return {
				email: [
					{ type: 'email', message: this.$t('emailInvalido'), trigger: 'blur' },
					{ required: true, message: this.$t('ingresaTuEmail') }
				],
				password: [
					{
						required: true,
						message: this.$t('noOlvidesEsto'),
						trigger: 'blur'
					},
					{
						type: 'string',
						min: 1,
						message: this.$t('muyCorto'),
						trigger: 'blur'
					}
				]
			}
		},
		reglasRegistro() {
			return {
				nombre: [{ required: true, message: '*', whitespace: true }],
				apellido: [{ required: true, message: '*', whitespace: true }],

				email: [
					{ type: 'email', message: this.$t('emailInvalido'), trigger: 'blur' },
					{ required: true, message: this.$t('ingresaTuEmail') }
				],
				password: [
					{
						required: true,
						message: this.$t('noOlvidesEsto'),
						trigger: 'blur'
					},
					{
						type: 'string',
						min: 1,
						message: this.$t('muyCorto'),
						trigger: 'blur'
					}
				]
			}
		}
	},
	watch: {
		'cuenta.email'() {
			this.passIncorrectos = []
		}
	},
	methods: {
		procesarIngreso() {
			console.log('procesarIngreso')
			this.$refs.formIngreso.validate(valid => {
				if (valid) {
					// const c = this.cuenta
					console.info('formulario valido')
					const { email, password } = this.cuenta
					this.ingresar({ email, password })
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async ingresar({ email, password }) {
			const _ = this._
			this.$consolo.log('ingresar', { email, password })
			this.conectando = true
			try {
				const r = await this.$cuenta.ingresar(email, password)
				this.$consolo.log('r', r)

				if (!r.ok) {
					if (_.get(r, 'error.email') === 'noExiste') {
						// const vm = this
						// this.$info({
						// 	title: vm.$t('correoNoRegistrado'),
						// 	content: vm.$t('emailSinCuenta'),
						// 	width: 'auto',
						// 	okText: vm.$t('registrarme'),
						// 	onOk () { vm.modoActivo = 'registro' },
						// 	closable: true,
						// 	maskClosable: true,
						// 	cancelText: vm.$t('cancelar'),
						// 	centered: true
						// })
						this.emailsNoExistentes = [...this.emailsNoExistentes, email]
					} else if (_.get(r, 'error.password') === 'incorrecto') {
						this.passIncorrectos = [...this.passIncorrectos, password]
					}
				}
			} catch (e) {
				this.conectando = false
			}
			this.conectando = false
		},

		procesarRegistro() {
			console.log('procesarRegistro')
			this.$refs.formRegistro.validate(valid => {
				if (valid) {
					const c = this.cuenta
					this.registrar(c.nombre, c.apellido, c.email, c.password)
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async registrar(nombre, apellido, email, pass) {
			this.$consolo.log('registrar', { nombre, apellido, email, pass })
			this.conectando = true
			try {
				await this.$cuenta.crearCuenta(nombre, apellido, email, pass)
			} catch (e) {
				this.$consolo.error('registrar', e)
				this.conectando = false
			}
			this.conectando = false
		},

		resetRegistro() {
			this.$refs.formRegistro.resetFields()
		},

		pasarA(el) {
			el.focus()
		}
	},
	traducciones: {
		// FORMULARIO
		// ingreso
		ingresaATuCuenta: { es: 'Ingresa a tu cuenta' },
		correo: { es: 'Correo' },
		contrasena: { es: 'Contraseña' },
		conectando: { es: 'Conectando' },
		ingresar: { es: 'Ingresar' },
		passIncorrecto: { es: 'Incorrecto' },
		correoNoRegistrado: { es: 'Correo no registrado' },
		emailSinCuenta: { es: 'El email ingresado no tiene cuenta' },
		// registro
		creaTuCuenta: { es: 'Crea tu cuenta' },
		nombre: { es: 'Nombre' },
		apellido: { es: 'Apellido' },
		creandoCuenta: { es: 'Creando cuenta' },
		crearla: { es: 'Crearla' },

		// acciones
		yaTienes: { es: 'Ya tienes una cuenta?' },
		ingresa: { es: 'Ingresa' },
		eresNuevo: { es: 'Eres nuevo aquí?' },
		cancelar: { es: 'Cancelar' },
		registrate: { es: 'Regístrate' },
		registrarme: { es: 'Registrarme' },
		confirmarCambioPass: { es: 'Confirmar cambio' },
		operacionNoSolicitada: { es: 'Operación no solicitada' },

		// VALIDACION
		falta: { es: 'Falta' },
		// ingreso
		emailInvalido: { es: 'E-mail inválido' },
		ingresaTuEmail: { es: 'Ingresa tu e-mail' },
		muyCorto: { es: 'Muy corto' },
		// registro
		noOlvidesEsto: { es: 'No olvides esto' },

		errorDeRed: { es: 'Error de red', en: 'Network error', pt: 'Error de red' }
	}
}
</script>
<style lang="sass" scoped>
@import "~/sass/comun"
.rootFormIngreso
	width: 100%
	max-width: 100%
	position: relative
	z-index: 9
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


	::v-deep
		.ant-form-item-label
			.ant-form-item-required::before
				display: none

	.sinConexion
		margin-top: 1em
		color: $error
		text-align: center
		display: flex
		justify-content: center
		.oicono
			margin-right: .5em


/*Errores de formulario*/
.ant-form-explain, .ant-form-extra
		// font-size: $font-size-xs !important
.ant-form-vertical .ant-form-explain
	// font-size: $font-size-xs !important
.has-error .ant-form-explain, .has-error .ant-form-split
	color: $error
	// font-size: $font-size-xs !important
	letter-spacing: .5px !important


.rootFormIngreso::v-deep
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
