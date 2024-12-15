import vine from '@vinejs/vine'

export const createCartValidator = vine.compile(
    vine.object({
        qntd: vine.number(), 
        Product_id: vine.number(),
        name: vine.string(),
        price: vine.number(),
        image: vine.string(),
        User_id: vine.number()
    })
)

/**table.increments('id')
      table.integer('qntd')
      table.integer('Product_id')
      table.text('name')
      table.decimal('price')
      table.text('image')
      table.integer('User_id') */