import http from 'node:http'
import path from 'node:path'
import process from 'node:process'

import KoaRouter from '@koa/router'
import views from '@ladjs/koa-views'
import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import convert from 'koa-convert'
import json from 'koa-json'
import logger from 'koa-logger'
import koaStatic from 'koa-static'

import MidReturn from './middlewares/return'
import index from './routes/index'

const router = new KoaRouter()

const app = new Koa<Objable, {
    success: AnyFn
    error: AnyFn
}>()
// middlewares
app.use(convert(bodyparser()))
app.use(convert(json()))
app.use(convert(logger()))
app.use(convert(koaStatic(path.join(__dirname, 'public'))))

app.use(views(path.join(__dirname, '../views'), { extension: 'ejs' }))

app.use(MidReturn)

app.use(index.routes())
app.use(router.allowedMethods())

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
})

const port = process.env.PORT || '4000'

const server = http.createServer(app.callback())

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

interface Errors extends Error {
    syscall: string
    code: string
}

/**
 * 处理监听错误的函数。
 * @param error 错误对象，预期为Errors类型，包含错误的详细信息。
 * 该函数不返回任何内容，但可能会因错误而使进程退出。
 */
function onError(error: Errors) {
    // 如果错误不是监听相关的，则直接抛出错误
    if (error.syscall !== 'listen') {
        throw error
    }

    // 根据端口类型（字符串或数字），生成相应的绑定信息
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

    // 根据错误代码，提供友好的错误消息并处理
    switch (error.code) {
        case 'EACCES':
            // 如果是权限错误，输出错误信息并退出进程
            console.error(`${bind} requires elevated privileges`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            // 如果端口已被占用，输出错误信息并退出进程
            console.error(`${bind} is already in use`)
            process.exit(1)
            break
        default:
            // 对于其他错误，抛出错误
            throw error
    }
}

/**
 * 当服务器开始监听时调用的函数。
 * 该函数没有参数和返回值。
 * 主要用于输出服务器监听的地址和端口信息。
 */
function onListening() {
    // 获取服务器监听的地址信息
    const addr = server.address()!
    const bind = typeof addr === 'string' ? `${addr}` : `${addr.port}`
    // 打印监听的地址和端口信息
    console.log(`Listening on: http://localhost:${bind}`)
}
