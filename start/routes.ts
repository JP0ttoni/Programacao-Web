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
import router from '@adonisjs/core/services/router'

//router.on('/').render('pages/home')
router.group(()=>{
    router.get('/', [UserscontrollersController, 'index']).as('list_users')
    router.get('/:id', [UserscontrollersController, 'show']).as('match_id')
    router.post('/', [UserscontrollersController, 'create']).as('create')
}).prefix('users')

router.group(()=>{

    router.get('/ok', () => {
        return "tudo certo>"
    })
    router.get('/kay', () => {
        return "kay kay = meu momo"
    })
    router.get('/guga', () => {
        return "guga gay"
    })
}).prefix('others')

router.group(()=>{
    router.get('/', [ProductsController, 'index']).as('list_products')
    router.get('/:id', [ProductsController, 'show']).as('product_match')
    router.post('/', [ProductsController, 'store']).as(' product_store')
    router.delete('/:id', [ProductsController, 'destroy']).as('product_delete')
    router.patch('/:id', [ProductsController, 'patch']).as('product_patch')
}).prefix('products')

router.get('/yt', [ProductsController, 'yt'])
router.get('/health', [ProductsController, 'health'])
router.get('/mlivre', [ProductsController, 'mlivre'])
router.post('/test', [ProductsController, 'test'])

router.get('/', async ({view}) => {
    const products = await Product.all()
    return view.render('pages/index', {products})
})

router.post('/login', ({request}) => {
    console.log(request.all())
    return 'fiz login'
})
