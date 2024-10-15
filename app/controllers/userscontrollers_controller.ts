// import type { HttpContext } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'
import { messages } from '@vinejs/vine/defaults';

let sequence = 2

const users = [
  {
    id: 1,
    name: 'Tonin_Rodrigues',
    email: 'JEIPI@gmail.com',
  },
  {
    id: 2,
    name: 'Kay_Kay_baloon',
    email: '',
  },
]

export default class UserscontrollersController {
    index()
    {
        return users;
    }

    show({params, response}: HttpContext)
    {
        const id = params.id
        if(id === null)
        {
            return{message: 'id obrigatorio'}
        }

        for(const user of users)
        {
            if(user.id == id || user.name == id)
            {
                return user;
            }
        }

        response.status(404)

        return{message: 'not found'}
    }

    create({ request, response }:HttpContext)
    {
        const user = request.only(['name', 'email'])
        sequence += 1

        users.push({
            id: sequence,
            ...user,
          })
        return response.redirect().toRoute('match_id', { id: sequence })
    }
}