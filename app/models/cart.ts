import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare qntd: number

  @column()
  declare Product_id: number

  @column()
  declare name: string

  @column()
  declare price: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare image: string

  @column()
  declare User_id: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

/*table.increments('id')
      table.integer('qntd')
      table.integer('Product_id')
      table.text('name')
      table.decimal('price')*/