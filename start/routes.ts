/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import UserscontrollersController from '#controllers/userscontrollers_controller'
import router from '@adonisjs/core/services/router'

//router.on('/').render('pages/home')
router.group(()=>{
    router.get('/', [UserscontrollersController, 'index']).as('list_users')
    router.get('/:id', [UserscontrollersController, 'show']).as('match_id')
    router.post('/', [UserscontrollersController, 'create']).as('create')
}).prefix('users')

router.get('/ok', () => {
    return "tudo certo>"
})

router.get('/kay', () => {
    return "kay kay = meu momo"
})

router.get('/guga', () => {
    return "guga gay"
})
