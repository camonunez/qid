import { customAlphabet as SincCustomAlphabet } from 'nanoid'
import { customAlphabet } from 'nanoid/async'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const MiniID = customAlphabet(alphabet, 10)

export const SincMiniID = SincCustomAlphabet(alphabet, 10)

export default MiniID
