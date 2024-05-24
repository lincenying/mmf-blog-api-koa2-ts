import { Buffer } from 'node:buffer'
import md5 from 'md5'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { strLen } from '@lincy/utils'
import { md5Pre, mpappApiId, mpappSecret, secretClient as secret } from '../config'
import { getErrorMessage, getNowTime } from '../utils'

import UserM from '../models/user'
import type { KoaContext, Lists, ResData, User, UserCookies, UserModify } from '@/types'

/**
 * 用户列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    let json: ResData<Nullable<Lists<User[]>>>
    const reqQuery = res.query as { page?: number; limit?: number }

    const sort = '-_id'
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 10
    const skip = (page - 1) * limit

    try {
        const [list, total] = await Promise.all([
            UserM.find().sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            UserM.countDocuments(),
        ])
        const totalPage = Math.ceil(total / limit)
        json = {
            code: 200,
            data: {
                list,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 用户登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function login(res: KoaContext) {
    let json: ResData<Nullable<UserCookies>>
    const reqBody = res.body as { username: string; password: string }

    let {
        username,
    } = reqBody

    const {
        password,
    } = reqBody

    if (username === '' || password === '') {
        json = { code: -200, data: null, message: '请输入用户名和密码' }
    }

    try {
        const filter = {
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        }
        const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
        if (result) {
            username = encodeURI(username)
            const {
                _id: id,
                email: useremail,
            } = result

            const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
            const token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookies.set('user', token, { maxAge: remember_me, httpOnly: false })
            res.cookies.set('userid', id, { maxAge: remember_me, httpOnly: false })
            res.cookies.set('username', Buffer.from(username).toString('base64'), { maxAge: remember_me, httpOnly: false })
            res.cookies.set('useremail', useremail, { maxAge: remember_me, httpOnly: false })
            json = {
                code: 200,
                message: '登录成功',
                data: {
                    user: token,
                    userid: id,
                    username,
                    useremail,
                },
            }
        }
        else {
            json = { code: -200, data: null, message: '用户名或者密码错误' }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 微信登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function jscodeToSession(res: KoaContext) {
    const reqBody = res.body as { js_code: string }

    const {
        js_code,
    } = reqBody

    const xhr = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
            appid: mpappApiId,
            secret: mpappSecret,
            js_code,
            grant_type: 'authorization_code',
        },
    })

    const json: ResData<any> = { code: 200, message: '登录成功', data: xhr.data }

    res.json(json)
}
/**
 * 微信登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function wxLogin(res: KoaContext) {
    let json: ResData<Nullable<UserCookies>>
    const reqBody = res.body as { nickName: string; wxSignature: string; avatar: string }

    const {
        nickName,
        wxSignature,
        avatar,
    } = reqBody

    let id, token, username
    if (!nickName || !wxSignature) {
        json = { code: -200, data: null, message: '参数有误, 微信登录失败' }
    }
    else {
        try {
            const filter = {
                username: nickName,
                wx_signature: wxSignature,
                is_delete: 0,
            }
            const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
            if (result) {
                id = result._id
                username = encodeURI(nickName)
                token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                json = {
                    code: 200,
                    message: '登录成功',
                    data: {
                        user: token,
                        userid: id,
                        username,
                    },
                }
            }
            else {
                const creatData = {
                    username: nickName,
                    password: '',
                    email: '',
                    creat_date: getNowTime(),
                    update_date: getNowTime(),
                    is_delete: 0,
                    timestamp: getNowTime('X'),
                    wx_avatar: avatar,
                    wx_signature: wxSignature,
                }
                const _result = await UserM.create(creatData).then(data => data?.toObject())
                id = _result._id
                username = encodeURI(nickName)
                token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                json = {
                    code: 200,
                    message: '注册成功!',
                    data: {
                        user: token,
                        userid: id,
                        username,
                    },
                }
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }
    res.json(json)
}

/**
 * 用户退出
 * @param res 上下文对象，包含请求和响应的信息。
 */
export function logout(res: KoaContext) {
    res.cookies.set('user', '', { maxAge: -1, httpOnly: false })
    res.cookies.set('userid', '', { maxAge: -1, httpOnly: false })
    res.cookies.set('username', '', { maxAge: -1, httpOnly: false })
    res.cookies.set('useremail', '', { maxAge: -1, httpOnly: false })

    const json: ResData<string> = { code: 200, message: '退出成功', data: 'success' }

    res.json(json)
}

/**
 * 用户注册
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    let json: ResData<string | null>
    const reqBody = res.body as { email: string; password: string; username: string }

    const {
        email,
        password,
        username,
    } = reqBody

    if (!username || !password || !email) {
        json = { code: -200, data: null, message: '请将表单填写完整' }
    }
    else if (strLen(username) < 4) {
        json = { code: -200, data: null, message: '用户长度至少 2 个中文或 4 个英文' }
    }
    else if (strLen(password) < 8) {
        json = { code: -200, data: null, message: '密码长度至少 8 位' }
    }
    else {
        try {
            const result = await UserM.findOne({ username }).exec().then(data => data?.toObject())
            if (result) {
                json = { code: -200, message: '该用户名已经存在!', data: 'error' }
            }
            else {
                await UserM.create({
                    username,
                    password: md5(md5Pre + password),
                    email,
                    creat_date: getNowTime(),
                    update_date: getNowTime(),
                    is_delete: 0,
                    timestamp: getNowTime('X'),
                })
                json = { code: 200, message: '注册成功!', data: 'success' }
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }
    res.json(json)
}

/**
 * 获取用户信息
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    let json: ResData<Nullable<User>>
    const reqQuery = res.query as { id: string }

    const userid = (reqQuery.id || res.cookies.get('userid') || res.header.userid) as string

    try {
        const filter = { _id: userid, is_delete: 0 }
        const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
        if (result) {
            json = { code: 200, data: result, message: 'success' }
        }
        else {
            json = { code: -200, data: null, message: '请先登录, 或者数据错误' }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 用户编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function modify(res: KoaContext) {
    let json: ResData<Nullable<User>>
    const reqBody = res.body as { id: string; email: string; password: string; username: string }

    const {
        id,
        email,
        password,
        username,
    } = reqBody

    const body: UserModify = {
        email,
        username,
        update_date: getNowTime(),
    }
    if (password) {
        body.password = md5(md5Pre + password)
    }

    try {
        const filter = { _id: id }
        const result = await UserM.findOneAndUpdate(filter, body, { new: true }).exec().then(data => data?.toObject())
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 账号编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function account(res: KoaContext) {
    let json: ResData<string | null>
    const reqBody = res.body as { email: string }

    const {
        email,
    } = reqBody

    const user_id = (res.cookies.get('userid') || res.header.userid) as string
    try {
        await UserM.updateOne<User>({ _id: user_id }, { $set: { email } }).exec()
        res.cookies.set('useremail', email, { maxAge: 2592000000 })
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 密码编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function password(res: KoaContext) {
    let json: ResData<string | null>
    const reqBody = res.body as { old_password: string; password: string }

    const {
        old_password,
        password,
    } = reqBody

    const user_id = (res.cookies.get('userid') || res.header.userid) as string
    try {
        const filter = {
            _id: user_id,
            password: md5(md5Pre + old_password),
            is_delete: 0,
        }

        const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
        if (result) {
            const filter = {
                _id: user_id,
            }
            const body = {
                $set: {
                    password: md5(md5Pre + password),
                },
            }
            await UserM.updateOne(filter, body)
            json = { code: 200, message: '更新成功', data: 'success' }
        }
        else {
            json = { code: -200, message: '原始密码错误', data: 'error' }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 用户删除
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    let json: ResData<string | null>
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const body = {
            is_delete: 1,
        }
        await UserM.updateOne(filter, body).exec()
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 用户恢复
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    let json: ResData<string | null>
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const body = {
            is_delete: 0,
        }
        await UserM.updateOne(filter, body).exec()
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}
