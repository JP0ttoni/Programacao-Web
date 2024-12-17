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

        const fotos = ['https://www.gsuplementos.com.br/upload/produto/imagem/creatina-250g-creapure-growth-supplements-1.webp', 'http://http2.mlstatic.com/D_847810-MLU72760574572_112023-O.jpg'
            , 'https://www.gsuplementos.com.br/upload/produto/imagem/hot-termog-nico-60-comprimidos-growth-supplements.webp', 'https://product-data.raiadrogasil.io/images/3446808.webp'
            , 'https://lojamaxtitanium.vtexassets.com/arquivos/ids/157542/mass-titanium-zero-lactose-max-titanium-2.4kg-morango-1.jpg?v=638348708952130000'
            , 'https://www.gsuplementos.com.br/upload/produto/imagem/vitamina-c-120-caps-growth-supplements-1.webp', 'https://lojamaxtitanium.vtexassets.com/arquivos/ids/157369/beta-alanina-max-titanium-150g-1.jpg?v=638343764574630000'
            , 'https://www.gsuplementos.com.br/upload/produto/imagem/albumina-500g-growth-supplements.webp', 'https://drogariasp.vteximg.com.br/arquivos/ids/626642-1000-1000/689645---glutamina-natural-integral-medica-150g.jpg?v=637866877301370000'
            , 'https://www.gsuplementos.com.br/upload/produto/imagem/cafe-na-200mg-60-caps-growth-supplements-termog-nico.webp', 'https://integralmedica.vtexassets.com/arquivos/ids/165306/ARGININE.png?v=638203651597000000',
            'https://www.gsuplementos.com.br/upload/produto/imagem/bcaa-5-1-1-200g-em-p-growth-supplements-3.webp']


        //await auth.use('web').logout()

        return view.render('pages/products/index', {products: products_type, fotos})

    }

    async type_product({ request, view, auth, session }: HttpContext)
    {
        if(await auth.check()){
            await auth.authenticate()
        }

        const search = request.only(['search'])
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
        const limit = 8

        const query = Product.query()
        if(payload.type && payload.type.length > 0)
        {
                query.where('type', 'LIKE', `%${payload.type}%`)
                
        }
            
            if(!payload.type){
                query.where('type', 'LIKE', `%${search.search}%`)
                .orWhere('name', 'LIKE', `%${search.search}%`) // Busca parcial no nome
                .orWhere('description', 'LIKE', `%${search.search}%`)
            }
        const avals = await Aval.all()
        let qntd_avals = []

        let photos = await ProductImage.all()
        photos = photos.reverse()

        let fotos = []

        for(let i in photos)
        {
            if(fotos[photos[i].productId] == undefined)
            {
                fotos[photos[i].productId] = photos[i].imagePath
            }
        }
        console.log(fotos)

        for(let i in avals)
        {
            if(qntd_avals[avals[i].product_id] == undefined)
            {
                qntd_avals[avals[i].product_id] = 0
            }
            qntd_avals[avals[i].product_id]++
            console.log(qntd_avals[avals[i].product_id])
        }

        const products = await query.paginate(paginate, limit)
            
            return view.render('pages/products/type', { products: products.rows, avals: qntd_avals, photos: fotos })
        //adicionar ids//products.rows: Essa propriedade contém apenas os dados reais da consulta, sem os metadados de paginação.
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

    async aval_delete({ response, params}: HttpContext)
    {
        try {
            // Encontrar o produto pelo ID
            const aval = await Aval.findOrFail(params.id)
            console.log(aval)
            await aval.delete()
            
            return response.redirect().back()
        } catch (error) {
            // Caso não encontre o produto, retorna um erro
            return { error: `Produto com ID ${params.id} não encontrado.` }
        }
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


        return response.redirect('/products/create')
    }

    async destroy({ params, response }: HttpContext) {
        try {
            // Encontrar o produto pelo ID
            const product = await Product.findOrFail(params.id)
            console.log(product)
            await product.delete()
            
            return response.redirect('/products')
        } catch (error) {
            // Caso não encontre o produto, retorna um erro
            return { error: `Produto com ID ${params.id} não encontrado.` }
        }
        

        return { sucess: `${params.id} removido` }
    }

    async patch({ params, request, response }: HttpContext) {

        console.log(request.all())
        const operation = request.only(['operation']).operation
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
        
        let new_qntd
        // Atualizar a quantidade do produto
        if(operation == 'remove')
        {
            new_qntd = product.qntd - pay_qntd;
        }else{
            new_qntd = product.qntd + pay_qntd;
        }
        if(new_qntd < 0)
        {
            new_qntd = 0;
        }
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

