import vine from '@vinejs/vine'
import { title } from 'process'

export const createProductValidator = vine.compile(
    vine.object({
        name: vine.string(), 
        price: vine.number(),
        type: vine.string(),
        description: vine.string(),
        qntd: vine.number()
    })
)