/**
 * Pull react-date-range into the initial webpack graph so it is not served only as a
 * separate async chunk (avoids ChunkLoadError when that chunk 404s after HMR/cache drift).
 */
import { Calendar, DateRangePicker } from 'react-date-range';

export const reactDateRangePreload = { Calendar, DateRangePicker };
