import type { KoaContext } from '../types'
import * as helper from './frontend-like.helper'

/**
 * 文章点赞
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function like(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    const user_id = (res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.like(reqQuery, user_id))
}

/**
 * 取消文章点赞
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function unlike(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    const user_id = (res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.unlike(reqQuery, user_id))
}

/**
 * 重置文章点赞数量
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function resetLike(res: KoaContext) {
    res.json(helper.resetLike())
}
