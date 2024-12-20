// import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http'
import { messages } from '@vinejs/vine/defaults';
import  hash from '@adonisjs/core/services/hash'
import { request } from 'http';
import Aval from '#models/aval';
import { createLoginValidator, createUserValidator } from '#validators/user';

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

    async store({ request, view, auth, response, session }:HttpContext)
    {
      if(await auth.check())
        {
            return response.redirect('/')
        }
        console.log(request.all())
        const user = await createUserValidator.validate(request.all())
        //request.only(['fullName', 'password', 'username', 'email'])
        try {
          const data_user = await User.create(user)
          await auth.use('web').login(data_user)
          await auth.authenticate()        
        } catch (error) {
          session.flash({ errors: { login: 'Não foi possível criar o usuário. E-mail já está em uso.' } })
          return response.redirect().back()
        }

        if(auth.isAuthenticated)
        {
          console.log('autenticado')
        } else{
          console.log
        }
    
        // Renderizar a view de home
        return response.redirect('/')
    }

    async login({ request, view, auth, response, session }: HttpContext)
    {
      console.log('entrou nessa caralha')
      if(await auth.check())
      {
          return response.redirect('/')
      }
      try{
        const { email, password } = await createLoginValidator.validate(request.all())
        
        const user = await User.query().where('email', email).first()// retorna null se não encontrar usuario
        console.log(`email: ${user}\npassword: ${password}`)
          if(user){
            console.log("entrou1")
            if(await hash.verify(user.password, password))
            {
              await auth.use('web').login(user)
              auth.authenticate()
              return response.redirect('/')
            }else{
              console.log("entrou2")
              session.flashOnly(['email'])
              session.flash({ errors: { login: 'Não encontramos nenhuma conta com essas credenciais.' } })
              return response.redirect().back();
            }
          }
          session.flash({ errors: { login: 'Não encontramos nenhuma conta com essas credenciais.' } })
          return response.redirect().back();
      }catch(erro)
      {
        console.log("entrou3")
        session.flash({ errors: { login: 'Não encontramos nenhuma conta com essas credenciais.' } })
        return response.redirect().back();
      }
      
    }

    async patch({ auth, request, view, response }:HttpContext)
    {
      if(!await auth.check())
        {
            return response.redirect('/')
        }
      await auth.check()
      const id = auth.user?.id
      const user = await User.findByOrFail('id', id)
      const users_aval = await Aval.query().where('user_email', 'like', `${auth.user?.email}`)
      const payload = await request.only(['username', 'password', 'fullName'])
      if(payload.username == null)
      {
        delete payload.username
      }
      if(payload.password == null)
      {
        delete payload.password
      }
      if(payload.fullName == null)
      {
        delete payload.fullName
      }else{
        for(const aval of users_aval)
        {
          aval.merge({person_name: payload.fullName})
          await aval.save()
        }
      }
      console.log(payload)
      user.merge(payload)
      await user.save()
      auth.authenticate()
      return response.redirect('/')
    }
}