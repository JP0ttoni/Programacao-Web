import Aval from '#models/aval'
import Product from '#models/product'
import auth from '@adonisjs/auth/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import { debug } from 'console'
import { request } from 'http'

export default class ProductsController {
    //pegando info de API
    async index({ view, auth }: HttpContext) {

        await auth.authenticate()

        const products = ['creatina', 'pre treino', 'termogenico']

        //await auth.use('web').logout()

        return view.render('pages/products/index', {products})

    }

    async type_product({ request, view, auth }: HttpContext)
    {
        await auth.authenticate()
        const paginate = request.input('page', 1)//se n receber page, seta o default como 1
        const limit = 10
        const payload = request.only(['type'])

        const query = Product.query()
        if(payload.type && payload.type.length > 0)
        {
            query.where('type', 'like', `%${payload.type}`)
        }

        const products = await query.paginate(paginate, limit)

        return view.render('pages/products/type', { products: products.rows })//products.rows: Essa propriedade contém apenas os dados reais da consulta, sem os metadados de paginação.
    }

    async show({ params, view, auth }: HttpContext) {

        await auth.authenticate()
        console.log('entrou')
        const avals = await Aval.query().where('product_id', params.id)
        const nums = []
        for(const aval of avals){
            nums.push(aval.rate)
        }
        const product = await Product.findOrFail(params.id)
        let sum = 0
        for(const num of nums)
        {
            sum += num
        }

        sum = sum/nums.length
        sum = Math.round(sum)
        console.log(sum)
        product.merge({rate: sum})
        await product.save()
        return view.render('pages/products/show', { product, avals: avals })
    }

    async aval({ params, view, request, auth }: HttpContext)
    {
        await auth.authenticate()
        const user_id = request.only(['user_id'])
        //const user_name = Aval.query().where('id', 'like', `${user_id}`)
        return view.render('pages/products/aval', {product_id: params.id, user_name: 'joão'})
    }

    async aval_post({params, request, view, auth }: HttpContext)
    {
        await auth.authenticate()
        let payload = request.only(['person_name', 'rate', 'comment', 'photo', 'product_id'])
        payload.rate = parseInt(request.input('rate'))
        payload.product_id = parseInt(params.id)
        await Aval.create(payload)
        console.log(request.all())

        return view.render('pages/products/aval_posted')
    }

    async store({ request }: HttpContext) {
        const payload = request.only(['name', 'price', 'description', 'type'])
        //product é o minha entidade para consultar o banco de dados, que eu criei, na hora de criar o model
        const product = await Product.create(payload)//carga util
        return product
    }

    async destroy({ params }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        await product.delete()

        return { sucess: `${params.id} removido` }
    }
    
    async patch({ params, request }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        const payload = await request.only(['name', 'price', 'description'])

        product.merge(payload)//troca pelo campo

        await product.save()//salvar a modificação no banco de dados

        return product
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

    async mlivre({ request }:HttpContext){
        const search = request.only(['product'])
        const data = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${search.product}`) 
        const datajson = await data.json()
        const ids = datajson.results.map(id => id.id)
        const data_item = await fetch(`https://api.mercadolibre.com/items/${ids[1]}`)
        const data_description = await fetch(`https://api.mercadolibre.com/items/${ids[1]}/description`)
        const tojson = await data_description.json()
       
       return datajson
    }
}

