// import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http'
import { messages } from '@vinejs/vine/defaults';
import  hash from '@adonisjs/core/services/hash'

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

    async store({ request, view, auth }:HttpContext)
    {
        console.log(request.all())
        const user = request.only(['fullName', 'password', 'username', 'email'])
        const data_user = await User.create(user)
        await auth.use('web').login(data_user)
        await auth.authenticate()

        if(auth.isAuthenticated)
        {
          console.log('autenticado')
        } else{
          console.log
        }
    
        // Renderizar a view de home
        return view.render('pages/home')
    }

    async login({ request, view, auth }: HttpContext)
    {
      const { email, password } = request.only(['email', 'password'])
      const user = await User.query().where('email', email).first()// retorna null se não encontrar usuario
      console.log(user)
      
      if (user) {
        console.log(password)
        if(await hash.verify(user.password, password))
        {
          await auth.use('web').login(user)
          auth.authenticate()
          return view.render('pages/home')
        }
      }
      return view.render('pages/users/login')
    }
}