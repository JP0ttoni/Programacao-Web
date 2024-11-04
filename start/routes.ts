/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import ProductsController from '#controllers/products_controller'
import UserscontrollersController from '#controllers/userscontrollers_controller'
import Product from '#models/product'
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import auth from '@adonisjs/auth/services/main'
import { request } from 'http'
import { products_type } from '../app/globalVar.js'

console.log()

//router.on('/').render('pages/home')
router.group(()=>{
    router.get('/', [UserscontrollersController, 'index']).as('list_users')
    router.get('/create_user', async ({ auth, view, response }) => {
        if(await auth.check())
            {
                return response.redirect('/')
            }
        return view.render('pages/users/create_user', { verify: false })
    })
    router.post('/login', [UserscontrollersController, 'login']).as('user_login')
    router.get('/edit', async({ auth, view, response }) =>{
        if(!await auth.check())
            {
                return response.redirect('/')
            }
        return view.render('pages/users/edit_user')
    }).as('edit_user')
    router.post('/patch', [UserscontrollersController, 'patch']).as('user_merge')
    router.get('/:id', [UserscontrollersController, 'show']).as('match_id')
    router.post('/', [UserscontrollersController, 'store']).as('create_user')
}).prefix('users')

router.group(()=>{
    router.get('/', [ProductsController, 'index']).as('list_products')
    router.get('/type', [ProductsController, 'type_product']).as('product_type')
    router.get('/create', async({ auth, view, response }) => {
        if(await auth.check())
        {
            if(auth.user?.username != 'admin')
            {
                return response.redirect('/')
            }
        }else{
            return response.redirect('/')
        }
        return view.render('pages/products/create')
    }).as('page_new_product')

    router.get('/create/modify', async({ auth, view, response }) => {
        if(await auth.check())
        {
            if(auth.user?.username != 'admin')
            {
                return response.redirect('/')
            }
        }else{
            return response.redirect('/')
        }
        return view.render('pages/products/create_modify', {check: false, produtos: products_type})
    }).as('page_new_product_modify')

    router.get('/:id', [ProductsController, 'show']).as('product_match')
    router.post('/', [ProductsController, 'store']).as('product_store')
    router.post('/:id', [ProductsController, 'aval']).as('product_aval')
    router.post('/:id/aval', [ProductsController, 'aval_post']).as('product_post_aval')
    router.delete('/:id', [ProductsController, 'destroy']).as('product_delete')
    router.patch('/:id', [ProductsController, 'patch']).as('product_patch')
}).prefix('products')

//router.get('/yt', [ProductsController, 'yt'])
//router.get('/health', [ProductsController, 'health'])
router.get('/mlivre', [ProductsController, 'mlivre']).use(middleware.auth())

router.get('/', async ({ view, auth, request, response }) => {

    console.log(auth.user?.username)

    const user = await User.findBy('username', 'admin')
    if(!user)
        {
            const admin = {username: 'admin', password: 'ottoni', fullName: 'joão Pedro ottoni', email: 'admin@gmail.com'}
            const log = await User.create(admin)
        }

        console.log( `resultado: ${(await auth.check())}`)
        //auth.isAuthenticated
        
        try {
            await auth.authenticate()
        } catch (error) {
            // Se a autenticação falhar, redirecione para a página de login ou outra página
            console.log('entrou, não')
            //return response.redirect('users/create_user'); // Substitua '/login' pela sua rota de login
        }
    
    const products = await Product.all()
    return view.render('pages/home', {products})
})

router.get('/login', async({ view, request, auth, response }) => {
    if(await auth.check())
    {
        return response.redirect('/')
    }
    console.log(request.all())
    return view.render('pages/users/login')
})

router.get('/logout', async ({ view, request, auth, response }) => {
    if(!await auth.check())
    {
        return response.redirect('/')
    }
    await auth.use('web').logout()
    return response.redirect('/')
})

