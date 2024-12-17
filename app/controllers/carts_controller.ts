import { Route, type HttpContext } from '@adonisjs/core/http'
import User from '#models/user';
import Cart from '#models/cart';
import auth from '@adonisjs/auth/services/main';
import { createCartValidator } from '#validators/cart';
import Product from '#models/product';

export default class CartsController {

    async store({auth, view, request, response, params, session}:HttpContext){
        //const user = await createUserValidator.validate(request.all())
        if(!await auth.check())
            {
                return response.redirect().back
            }

        const payload = await createCartValidator.validate(request.all())
        console.log(payload)
        const user_cart = await Cart.query().where('Product_id', 'like', `${payload.Product_id}`).andWhere('User_id', payload.User_id).first()

        console.log(user_cart)
        if(user_cart)
        {
            session.flash({ errors: { cart: 'Produto já está no carrinho' } })
            return response.redirect().back()
        }
        await Cart.create(payload)
        console.log("entrou no carrinho")
        
        //const cart = await createCartValidator.validate(request.all())
        //const cart_product = Cart.create(cart)

        session.flash({ sucess: { cart: 'Produto adicionado no carrinho!' } })
        return response.redirect().back()
    }

    async destroy({params, response}:HttpContext){
        try {
                    // Encontrar o produto pelo ID
                    const item = await Cart.findOrFail(params.id)
                    console.log(item)
                    if(item)
                    {
                        await item.delete()
                    }
                    
                    return response.redirect().back()
                } catch (error) {
                    // Caso não encontre o produto, retorna um erro
                    return { error: `Produto não encontrado.` }
                }
    }

    async patch({ auth, request, response, params }:HttpContext) {

        console.log("entrou aqui em patch")
        const { qntd } = request.only(['qntd']);  // Pegue diretamente a chave 'qntd'
        
        try {
            const item = await Cart.findOrFail(params.id); // Encontrar o item pelo ID
            item.merge({ qntd });  // Atualize o campo 'qntd' com o novo valor
            await item.save();  // Salve as alterações no banco
    
            return response.redirect().back()
        } catch (error) {
            console.error(error);
            return response.status(500).json({ success: false, message: 'Erro ao atualizar a quantidade' });  // Resposta de erro
        }
    }

    async pay({ auth, session, request, response, params, view }:HttpContext)
    {
        if(await auth.check())
            {
                auth.authenticate()
            }
            
            const cart = await Cart.query().where('User_id', 'like', `${auth.user?.id}`)
            console.log(cart)
            if(cart.length == 0){
                session.flash({ errors: { stock: `Carrinho vazio` } })
                return response.redirect().back()
            }
            for(const item of cart){
                console.log(`user_id: ${item.$extras.Product_id}`)
                const product = await Product.findOrFail(item.$extras.Product_id)
            if(item.qntd > product.qntd)
            {
                session.flash({ errors: { stock: `quantidade do produto "${item.name}" execede a quantidade presente no estoque` } })
                return response.redirect().back()
            }else{
                const new_qntd = product.qntd - item.qntd
                product.merge({ qntd: new_qntd })
                await product.save()
                await item.delete()

            }
        }
        return view.render('pages/checkout')
        
    }
}