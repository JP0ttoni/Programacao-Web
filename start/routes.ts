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
}).prefix('products')

router.get('/yt/:theme', [ProductsController, 'yt'])
