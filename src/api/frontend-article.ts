import type { KoaContext, ReqListQuery } from '~/types'
import * as helper from './frontend-article.helper'

/**
 * 前台浏览时, 获取文章列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    const reqQuery = res.query as ReqListQuery

    const user_id = (res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.getList(reqQuery, user_id))
}

/**
 * 前台浏览时, 获取单篇文章
 * @method
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    const user_id = (res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.getItem(reqQuery, user_id))
}

/**
 * 前台浏览时, 获取文章推荐列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getTrending(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.getTrending(reqQuery))
}
