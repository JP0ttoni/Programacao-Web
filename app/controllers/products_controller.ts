import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import { debug } from 'console'
import { request } from 'http'

export default class ProductsController {
    //pegando info de API
    async index({ request }: HttpContext) {
        /*const data = await fetch('https://fakestoreapi.com/products') 
        //necessidade de transformar pra json
        const products = await data.json() 
        return products*/

        const paginate = request.input('page', 1)//se n receber page, seta o default como 1
        const limit = 10
        const payload = request.only(['name'])
        const query = Product.query()
        console.log(payload)
        if(payload.name && payload.name.length > 0)
        {
            query.where('name', 'like', `%${payload.name}`)
        }

        const products = await query.paginate(paginate, limit)

        return Product.all()//Product.all()

    }

    async test({request}:HttpContext)
    {
        const data = request.only(['name'])
        console.log( data)
        return data 
    }

    async show({ params }: HttpContext) {
        /*const data = await fetch(`https://fakestoreapi.com/products/${params.id}`)//tem q usar crase
        const products = await data.json()
        //retornar apenas uma variavel do json return products.image*/
        const product = await Product.findOrFail(params.id)
        return product
    }

    async store({ request }: HttpContext) {
        const payload = request.only(['name', 'price', 'description'])
        //product é o minha entidade para consultar o banco de dados, que eu criei, na hora de criar o model
        const product = await Product.create(payload)
        return product
    }

    async destroy({ params }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        await product.delete()

        return { sucess: `${params.id} removido` }
    }

    async yt({ view, request }: HttpContext) {
        const query = request.only(['video']).video
        //const apikey = 'AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4'
        const url = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&key=AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4`)
        const data = await url.json()
        let videoIds = data.items.map(item => item.id.videoId).filter(videoID => videoID !== undefined && videoID !== null);
        videoIds = videoIds.slice(0,5)
        const base_url_video = 'https://www.youtube.com/watch?v='
        let videos = []

        console.log(query);

        for (const video_id of videoIds) {
            videos.push(`${base_url_video}${video_id}\n`)
        }

        const url_search = `https://www.youtube.com/results?search_query=${query}`

        const response = `os cinco primeiros resultados da sua busca no yt: \n${videos}\n pagina de pesquisa do youtube com a pesquisa:\n${url_search}`

        return view.render("pages/yt", {videoID: videoIds})
    }

    async patch({ params, request }: HttpContext) {
        const product = await Product.findOrFail(params.id)

        const payload = await request.only(['name', 'price', 'description'])

        product.merge(payload)//troca pelo campo

        await product.save()//salvar a modificação no banco de dados

        return product
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

