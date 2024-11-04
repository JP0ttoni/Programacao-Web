import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(3),
        fullName: vine.string().maxLength(50),
        username: vine.string().maxLength(20)
    })
)

export const createLoginValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(3)
    })
)