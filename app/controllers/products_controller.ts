import Aval from '#models/aval'
import { createPostValidator, createProductValidator } from '#validators/product'
import auth from '@adonisjs/auth/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import { debug, log } from 'console'
import { request } from 'http'
import { title } from 'process'
import { products_type } from '../globalVar.js'
import Product from '#models/product'
import ProductImage from '#models/product_image'


export default class ProductsController {
    //pegando info de API
    async index({ view, auth }: HttpContext) {

        if(await auth.check()){
            await auth.authenticate()
        }


        //await auth.use('web').logout()

        return view.render('pages/products/index', {products: products_type})

    }

    async type_product({ request, view, auth }: HttpContext)
    {
        if(await auth.check()){
            await auth.authenticate()
        }

        const payload = request.only(['type'])
        console.log(payload)
        /*const url = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${payload.type}&type=video&videoDuration=medium&regionCode=BR&relevanceLanguage=pt&key=AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4`)
        const data = await url.json()
        const videoIds = data.items.map(item => item.id.videoId).filter(videoID => videoID !== undefined && videoID !== null);
        let ids = []
        const channelID = data.items
        
        for(const canal of channelID)//fazendo a verificação se o canais retornados tem mais de 500mil inscritos e retornando os videos em q o canal tenha mais de 500mil inscritos
        {
            //console.log(canal)//UCthbIFAxbXTTQEC7EcQvP1Q   ${canal.snippet.channelId}
            let channel = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${canal.snippet.channelId}&key=AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4`)
            let jsonchannel = await channel.json()
            let verify = jsonchannel.items.map(item => item.statistics.subscriberCount)
            verify = parseInt(verify, 10)
            //console.log(verify)
            if(verify >= 500000)
            {
                ids.push(canal.id.videoId)
            }
        }

        ids = ids.slice(0,3)

        console.log(ids)*/

        const paginate = request.input('page', 1)//se n receber page, seta o default como 1
        const limit = 9

        const query = Product.query()
        if(payload.type && payload.type.length > 0)
        {
            query.where('type', 'like', `%${payload.type}`)
        }

        const products = await query.paginate(paginate, limit)

        return view.render('pages/products/type', { products: products.rows })//adicionar ids//products.rows: Essa propriedade contém apenas os dados reais da consulta, sem os metadados de paginação.
    }

    async show({ params, view, auth }: HttpContext) {

        if(await auth.check()){
            await auth.authenticate()
        }
        console.log('entrou')
        const avals = await Aval.query().where('product_id', params.id)
        const nums = []
        for(const aval of avals){
            nums.push(aval.rate)
        }
        const product = await Product.query()
      .where('id', params.id)
      .preload('images') // Precarregar imagens relacionadas
      .firstOrFail()

      const product_images: string[] = []
      product.images.forEach(image => {
        product_images.push(image.imagePath)  // Aqui você acessa o caminho de cada imagem
      })

        let sum = 0
        for(const num of nums)
        {
            sum += num
        }

        console.log(product)
        
        sum = sum/nums.length
        const formatado = sum.toFixed(1)
        sum = parseFloat(formatado)
        
        if(Number.isNaN(sum))
            {
                sum = 0;
            }
            console.log(sum)
            product.merge({rate: sum})
            await product.save()
            return view.render('pages/products/show', { product, product_images , avals: avals, id: params.id })
        }
        
    async aval({ params, view, request, auth, response }: HttpContext)
    {
        try {
            await auth.authenticate()
        } catch (error) {
            // Se a autenticação falhar, redirecione para a página de login ou outra página
            console.log('entrou, não')
            return response.redirect('users/create_user'); // Substitua '/login' pela sua rota de login
        }

        if(await auth.check()){
            await auth.authenticate()
        }
        const user_id = request.only(['user_id'])
        //const user_name = Aval.query().where('id', 'like', `${user_id}`)
        return view.render('pages/products/aval', {product_id: params.id, user_name: auth.user?.fullName, user_email: auth.user?.email})
    }

    async aval_post({params, request, view, auth, response }: HttpContext)
    {
        if(await auth.check()){
            await auth.authenticate()
        }
        try {
            await auth.authenticate()
        } catch (error) {
            // Se a autenticação falhar, redirecione para a página de login ou outra página
            console.log('entrou, não')
            return response.redirect('users/create_user'); // Substitua '/login' pela sua rota de login
        }
        let payload = request.only(['person_name', 'rate', 'comment', 'photo', 'product_id', 'user_email'])
        payload.rate = parseInt(request.input('rate'))
        payload.product_id = parseInt(params.id)
        await Aval.create(payload)
        console.log(request.all())

        return response.redirect('back')
    }

    async store({ request, view, response, auth, session }: HttpContext) {
        console.log("entrou pra verificar o produto")
        if(await auth.check())
            {
                if(auth.user?.username != 'admin')
                {
                    return response.redirect('/')
                }
            }else{
                return response.redirect('/')
            }
        const images = await request.only(["images"])
        const imagens = images.images.split(',')
        let payload = await createProductValidator.validate( request.all())
        payload.description = payload.description.replace(/&quot;/g, '')
        //request.only(['name', 'price', 'description', 'type'])
        //product é o minha entidade para consultar o banco de dados, que eu criei, na hora de criar o model
        try {
            const product = await Product.create(payload)//carga util
            for(const image of imagens){
                await ProductImage.create({
                    productId: product.id,
                    imagePath: `${image}`,
                  })
            }
        } catch (error) {
            return response.redirect('back')
        }


        return response.redirect('/')
    }

    async destroy({ params }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        await product.delete()

        return { sucess: `${params.id} removido` }
    }

    async patch({ params, request, response }: HttpContext) {
        // Extrair os dados do payload
        const payload = request.only(['product_id', 'qntd']);
    
        // Buscar o produto pelo ID
        const product = await Product.query().where('id', 'like', `${payload.product_id}`).first();
    
        // Verificar se o produto existe
        if (!product) {
            return response.status(404).send({ error: 'Product not found' });
        }
    
        // Validar e converter a quantidade
        const pay_qntd = parseInt(payload.qntd, 10);
        if (isNaN(pay_qntd)) {
            return response.status(400).send({ error: 'Invalid quantity provided' });
        }
    
        // Atualizar a quantidade do produto
        const new_qntd = product.qntd + pay_qntd;
        product.merge({ qntd: new_qntd });
    
        // Salvar as alterações no banco de dados
        await product.save();
    
        // Redirecionar para a rota de produtos
        return response.redirect('/products');
    }
    

    async yt({ view, request }: HttpContext) {
        const query = request.only(['video']).video 
        //const apikey = 'AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4'
        const url = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&videoDuration=medium&key=AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4`)
        const data = await url.json()
        const videoIds = data.items.map(item => item.id.videoId).filter(videoID => videoID !== undefined && videoID !== null);
        let ids = []
        const channelID = data.items
        
        for(const canal of channelID)//fazendo a verificação se o canais retornados tem mais de 500mil inscritos e retornando os videos em q o canal tenha mais de 500mil inscritos
        {
            //console.log(canal)//UCthbIFAxbXTTQEC7EcQvP1Q   ${canal.snippet.channelId}
            let channel = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${canal.snippet.channelId}&key=AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4`)
            let jsonchannel = await channel.json()
            let verify = jsonchannel.items.map(item => item.statistics.subscriberCount)
            verify = parseInt(verify, 10)
            //console.log(verify)
            if(verify >= 500000)
            {
                ids.push(canal.id.videoId)
            }
        }

        ids = ids.slice(0,5)

        console.log(query);

        return view.render("pages/others/yt", {videoID: ids})
    }


    async health() {
       const data =  await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients/?x-app-id=ab65000d&x-app-key=0259b07fca1aa7b20d33f594feed5855',{
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'x-app-id':'ab65000d',
            'x-app-key':'0259b07fca1aa7b20d33f594feed5855'
        },
        body: JSON.stringify({
            query: ""
        })
       })
       const datajson = await data.json()
       console.log(datajson)
       return datajson
    }

    async mlivre({ request, view, auth, response }:HttpContext){
        if(await auth.check())
            {
                if(auth.user?.username != 'admin')
                {
                    return response.redirect('/')
                }
            }else{
                return response.redirect('/')
            }
        const search = request.only(['product'])
        const data = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${search.product}`) 
        const datajson = await data.json()
        let ids = datajson.results.map(id => id.id)
        ids = ids.slice(0,10)
        /*const data_item = await fetch(`https://api.mercadolibre.com/items/MLB5024520380`)
        const data_item_json = await data_item.json()*/
        const data_description = await fetch(`https://api.mercadolibre.com/items/${ids[1]}/description`)
        const tojson = await data_description.json()
        const products = []

        for( const id of ids)
        {
            const data_item = await fetch(`https://api.mercadolibre.com/items/${id}`)
            const data_item_json = await data_item.json()
            const data_description = await fetch(`https://api.mercadolibre.com/items/${id}/description`)
            const tojson = await data_description.json()
            const query = await Product.query().where('name', data_item_json.title).first()
            if(!query)
            {
                const product = {
                    name: data_item_json.title,
                    price: data_item_json.price,
                    description: tojson.plain_text,
                    images: data_item_json.pictures.map(picture => picture.url),
                    type: null
                }
                products.push(product)
            }

        }

        console.log(products[0].images)


       
       return view.render('pages/products/accept_product', {products, produtos: products_type})
    }
}

