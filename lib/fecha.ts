import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import isBetween from 'dayjs/plugin/isBetween.js'
import duration from 'dayjs/plugin/duration.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import 'dayjs/locale/es-mx.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)
dayjs.extend(isBetween)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('es-mx')

export type { Dayjs }
export default dayjs
