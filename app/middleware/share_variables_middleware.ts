import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ShareVariablesMiddleware {
  async handle({ view }:HttpContext, next) {

    // Você pode passar qualquer variável que deseja
    view.share({
      user_name: null
    });

    await next();
  }
}