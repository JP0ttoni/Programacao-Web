 import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import { debug } from 'console'

export default class ProductsController {
    //pegando info de API
    async index()
    {
        /*const data = await fetch('https://fakestoreapi.com/products') 
        //necessidade de transformar pra json
        const products = await data.json() 
        return products*/

        const products = await Product.all()
        return products

    }

    async show({ params }:HttpContext)
    {
        /*const data = await fetch(`https://fakestoreapi.com/products/${params.id}`)//tem q usar crase
        const products = await data.json()
        //retornar apenas uma variavel do json return products.image*/
        const product = await Product.findOrFail(params.id)
        return product
    }

    async store({request}:HttpContext)
    {
        const payload = request.only(['name'])
        //product é o minha entidade para consultar o banco de dados, que eu criei, na hora de criar o model
        const product = await Product.create(payload)
        return product 
    }

    async destroy({ params }:HttpContext)
    {
         const product = await Product.findOrFail(params.id)

        await product.delete()

        return { sucess: `${params.id} removido`}
    }

    async yt({params}:HttpContext)
    {
        //const apikey = 'AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4'
        const url = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${params.theme}&key=AIzaSyAm95waKs6qAPRH_j67t5j_FYs7QvYHZz4`)
        const data =  await url.json()
        const videoIds = data.items.map(item => item.id.videoId);
        const base_url_video = 'https://www.youtube.com/watch?v='       
        let videos = []

        for(const video_id of videoIds)
        {
            videos.push(`${base_url_video}${video_id}\n`)
        }

        const url_search = `https://www.youtube.com/results?search_query=${params.theme}`

        const response = `os cinco primeiros resultados da sua busca no yt: \n${videos}\n pagina de pesquisa do youtube com a pesquisa:\n${url_search}`
        return response
    }

}