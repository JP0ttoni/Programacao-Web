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


//router.on('/').render('pages/home')
router.group(()=>{
    router.get('/', [UserscontrollersController, 'index']).as('list_users')
    router.get('/create_user', async ({ view }) => {
    
        return view.render('pages/users/create_user')
    })
    router.get('/:id', [UserscontrollersController, 'show']).as('match_id')
    router.post('/', [UserscontrollersController, 'store']).as('create_user')
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
    router.get('/type', [ProductsController, 'type_product']).as('product_type')
    router.get('/:id', [ProductsController, 'show']).as('product_match')
    router.post('/:id', [ProductsController, 'aval']).as('product_aval')
    router.post('/:id/aval', [ProductsController, 'aval_post']).as('product_post_aval')
    router.post('/', [ProductsController, 'store']).as(' product_store')
    router.delete('/:id', [ProductsController, 'destroy']).as('product_delete')
    router.patch('/:id', [ProductsController, 'patch']).as('product_patch')
}).prefix('products')

router.get('/yt', [ProductsController, 'yt'])
router.get('/health', [ProductsController, 'health'])
router.get('/mlivre', [ProductsController, 'mlivre'])

router.get('/', async ({ view, auth, response }) => {

    
    const user = await User.findBy('username', 'admin')
    if(!user)
        {
            const admin = {username: 'admin', password: 'ottoni', fullName: 'joão Pedro ottoni', email: 'jpottoni'}
            await User.create(admin)
        }
        
        try {
            await auth.authenticate()
        } catch (error) {
            // Se a autenticação falhar, redirecione para a página de login ou outra página
            console.log('entrou, não')
            return response.redirect('users/create_user'); // Substitua '/login' pela sua rota de login
        }
    
    const products = await Product.all()
    return view.render('pages/home', {products})
})

router.get('/login', ({ view, request, auth }) => {
    console.log(request.all())
    return view.render('pages/users/login')
})

/*class HomeController {
  async index({ view, auth }) {
    const user_name = auth.user ? auth.user.username : 'guest'; // ou sua lógica
    return view.render('app', { user_name }); // Passa a variável para o template
  }
}

await auth.login(user);
*/
