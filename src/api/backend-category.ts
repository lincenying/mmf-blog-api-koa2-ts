import CategoryM from '../models/category'
import { getErrorMessage, getNowTime } from '../utils'
import type { Category, CategoryInsert, CategoryModify, KoaContext, ResData } from '@/types'

/**
 * 管理时, 获取分类列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    let json: ResData<Nullable<{ list: Category[] }>>

    try {
        const result = await CategoryM.find().sort('-cate_order').exec().then(data => data.map(item => item.toObject()))
        json = {
            code: 200,
            data: {
                list: result,
            },
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 管理时, 获取分类详情
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    let json: ResData<Nullable<Category>>
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }

    try {
        const filter = { _id }
        const result = await CategoryM.findOne(filter).exec().then(data => data?.toObject())
        json = { code: 200, data: result }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 管理时, 新增分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    let json: ResData<Nullable<Category>>
    const reqBody = res.request.body as CategoryInsert

    const {
        cate_name,
        cate_order,
    } = reqBody

    if (!cate_name || !cate_order) {
        json = { code: -200, data: null, message: '请填写分类名称和排序' }
    }
    else {
        try {
            const creatData = {
                cate_name,
                cate_order,
                cate_num: 0,
                creat_date: getNowTime(),
                update_date: getNowTime(),
                is_delete: 0,
                timestamp: getNowTime('X'),
            }
            const result = await CategoryM.create(creatData).then(data => data.toObject())
            json = { code: 200, message: '添加成功', data: result }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    res.json(json)
}

/**
 * 管理时, 删除分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const body = { is_delete: 1 }
        await CategoryM.updateOne(filter, body).exec()
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 恢复分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const body = { is_delete: 0 }
        await CategoryM.updateOne(filter, body).exec()
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 编辑分类
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function modify(res: KoaContext) {
    const reqBody = res.request.body as CategoryModify

    const {
        id: _id,
        cate_name,
        cate_order,
    } = reqBody

    try {
        const filter = { _id }
        const body = {
            cate_name,
            cate_order,
            update_date: getNowTime(),
        }
        const result = await CategoryM.findOneAndUpdate(filter, body, { new: true }).exec().then(data => data?.toObject())
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}
