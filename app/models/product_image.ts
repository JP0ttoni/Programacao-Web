import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from './product.js'

export default class ProductImage extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public productId!: number

  @column()
  public imagePath!: string

  @belongsTo(() => Product)
  public product!: BelongsTo<typeof Product>
}