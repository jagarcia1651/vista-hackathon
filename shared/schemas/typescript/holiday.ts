/**
 * Holiday Entity Types
 */

import { BaseEntity, HolidayType } from './base'

export interface FirmHoliday extends BaseEntity {
  firm_holiday_id: string
  holiday_name: string
  holiday_type: string
  month: number
  day_of_month: number
  day_of_week?: string
  week_number?: string
  base_holiday_id?: string
  days_variance?: string
  special_calculation_flag?: string
} 