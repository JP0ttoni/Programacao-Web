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
import CartsController from '#controllers/carts_controller'
import Product from '#models/product'
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import auth from '@adonisjs/auth/services/main'
import { request } from 'http'
import { products_type } from '../app/globalVar.js'
import Cart from '#models/cart'

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
    router.post('/login/validate', [UserscontrollersController, 'login']).as('user_login')
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

    router.post('/add_stock', async({ view, request }) => {
        const id = await request.only(['product_id']).product_id
        console.log(id)
        const product = await Product.query().where('id', 'like', `${id}`).first();
        const qntd = product?.qntd
        return view.render('pages/products/add_stock', {product_id: id, qntd})

    }).as('add_stock')

    router.post('/stock_store', [ProductsController, 'patch']).as('stock_store')
    router.get('delete/:id', [ProductsController, 'destroy']).as('product_delete')
    router.get('/:id', [ProductsController, 'show']).as('product_match')
    router.post('/', [ProductsController, 'store']).as('product_store')
    router.post('/:id', [ProductsController, 'aval']).as('product_aval')
    router.post('/:id/aval', [ProductsController, 'aval_post']).as('product_post_aval')
}).prefix('products')

//router.get('/yt', [ProductsController, 'yt'])
//router.get('/health', [ProductsController, 'health'])
router.get('/mlivre', [ProductsController, 'mlivre'])

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

router.get('/aval/delete/:id',[ProductsController, 'aval_delete']).as('delete_aval')

router.group(()=>{
    router.post('/create', [CartsController, 'store']).as('cart_create')
    router.get('/', async({view, auth, response}) =>{
        if(!await auth.check())
        {
            console.log("negado")
            return response.redirect('/')
        }
        console.log('entrou em cart')
        const user_cart = await Cart.query().where('User_id', '=', `${auth.user?.id}`)
        if (user_cart.length > 0) {
            console.log(user_cart[0].$extras.Product_id);  // Agora deve funcionar
        } else {
            console.log("Carrinho vazio ou sem resultados");
        }
        return view.render('pages/cart', {user_cart: user_cart})
    }).as('cart')
    router.get('delete/:id', [CartsController, 'destroy']).as('cart_delete')
    router.post('/patch/:id', [CartsController, 'patch']).as('cart_patch')
    router.get('/checkout', [CartsController, 'pay']).as('cart_pay')
}).prefix('cart')




