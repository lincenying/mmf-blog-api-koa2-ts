import type { Next } from 'koa'
import type { KoaContext } from '~/types'

export default async (_ctx: KoaContext, next: Next) => {
    await next()
}
