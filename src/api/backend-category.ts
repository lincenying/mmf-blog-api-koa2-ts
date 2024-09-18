import type { CategoryInsert, CategoryModify, KoaContext } from '~/types'
import * as helper from './backend-category.helper'

/**
 * 管理时, 获取分类列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    res.json(await helper.getList())
}

/**
 * 管理时, 获取分类详情
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.getItem(reqQuery))
}

/**
 * 管理时, 新增分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    const reqBody = res.request.body as CategoryInsert

    res.json(helper.insert(reqBody))
}

/**
 * 管理时, 删除分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.deletes(reqQuery))
}

/**
 * 管理时, 恢复分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.recover(reqQuery))
}

/**
 * 管理时, 编辑分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function modify(res: KoaContext) {
    const reqBody = res.request.body as CategoryModify

    res.json(await helper.modify(reqBody))
}
