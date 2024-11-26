import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // ID da imagem
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE') // Relacionamento com products
      table.string('image_path').notNullable() // Caminho ou URL da imagem

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
