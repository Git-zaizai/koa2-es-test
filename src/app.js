import Koa from 'koa'
import KoaCors from '@koa/cors'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import koalogger from 'koa-logger'
import { uploads, staticPath } from './config/config.js'
import query, { MYSQL_NODE } from './db/mysql.js'
import mongodb from './db/mongodb.js'
import crud from './db/mysql-crud.js'
import routerSetup from './router/index.js'
import useToken from './use/useJwt.js'
import routerUrlToken from './config/url-jwt.js'
import corsConifg from './config/cors-conifg.js'

export default async function createApp(fn) {
    const createApp = new Koa()

    createApp.context.$query = query
    createApp.context.$crud = crud
    createApp.context.$mongodb = mongodb

    createApp
        .use(KoaCors(corsConifg))
        .use(serve(staticPath))
        .use(koaBody({
            formidable: {
                maxFieldsSize: 1024 * 1024 * 200,
                uploadDir: uploads,
            },
            multipart: true,
        }))
        .use(koalogger())
        .use(useToken(routerUrlToken, false))

    const router = await routerSetup()
    createApp.use(router.routes(), router.allowedMethods())


    console.log(`MySQL ==>${ MYSQL_NODE.config ? '成功' : '失败' }`)
    await mongodb()

    return { app: createApp, port: 4370 }
}
