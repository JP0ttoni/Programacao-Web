import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Aval extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare person_name: string 

  @column()
  declare user_email: string

  @column()
  declare product_id: number

  @column()
  declare comment: string

  @column()
  declare photos: string

  @column()
  declare rate: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}