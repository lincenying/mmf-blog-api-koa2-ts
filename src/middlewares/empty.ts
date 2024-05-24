import type { Next } from 'koa'
import type { KoaContext } from '@/types'

export default async (ctx: KoaContext, next: Next) => {
    await next()
}
