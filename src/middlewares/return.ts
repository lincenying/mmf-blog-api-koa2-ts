import type { Next } from 'koa'
import type { KoaContext } from '~/types'

export default async (ctx: KoaContext, next: Next) => {
    function errFunc<T>(data: T, message: string, other: Objable = {}) {
        ctx.body = {
            code: -200,
            message,
            data,
            ...other,
        }
    }
    function sucFunc<T>(data: T, message: string, other: Objable = {}) {
        ctx.body = {
            code: -200,
            message,
            data,
            ...other,
        }
    }
    function jsonFunc<T>(payload: T) {
        ctx.body = payload
    }
    ctx.error = errFunc
    ctx.success = sucFunc
    ctx.json = jsonFunc
    await next()
}
