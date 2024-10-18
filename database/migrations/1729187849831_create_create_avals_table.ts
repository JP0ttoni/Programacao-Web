import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'avals'
  

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('comment')
      table.text('photos')
      table.decimal('rate').notNullable
      table.string('person_name').notNullable
      table.decimal('product_id').notNullable


      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}