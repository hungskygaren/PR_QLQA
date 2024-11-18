// Import the framework and instantiate it
import envConfig, { API_URL } from '@/config'
import { errorHandlerPlugin } from '@/plugins/errorHandler.plugins'
import validatorCompilerPlugin from '@/plugins/validatorCompiler.plugins'
import accountRoutes from '@/routes/account.route'
import authRoutes from '@/routes/auth.route'
import fastifyAuth from '@fastify/auth'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import fastifySocketIO from 'fastify-socket.io'
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import path from 'path'
import { createFolder } from '@/utils/helpers'
import mediaRoutes from '@/routes/media.route'
import staticRoutes from '@/routes/static.route'
import dishRoutes from '@/routes/dish.route'
import testRoutes from '@/routes/test.route'
import { initOwnerAccount } from '@/controllers/account.controller'
import tablesRoutes from '@/routes/table.route'
import guestRoutes from '@/routes/guest.route'
import orderRoutes from '@/routes/order.route'
import { socketPlugin } from '@/plugins/socket.plugins'

const fastify = Fastify({
  logger: false
})
async function keepServerAlive(server: FastifyInstance) {
  try {
    // Tạo route health check
    server.get('/health', async (request, reply) => {
      reply.status(200).send({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // Ping server định kỳ
    setInterval(
      async () => {
        try {
          const response = await server.inject({
            method: 'GET',
            url: '/health'
          })

          if (response.statusCode === 200) {
            console.log('Server health check successful:', new Date().toISOString())
          } else {
            console.warn('Health check failed with status:', response.statusCode)
          }
        } catch (error) {
          console.error('Error during health check:', error)
        }
      },
      14 * 60 * 1000
    ) // 14 minutes
  } catch (error) {
    console.error('Error setting up keepServerAlive:', error)
  }
}
// Run the server!
const start = async () => {
  try {
    createFolder(path.resolve(envConfig.UPLOAD_FOLDER))
    const whitelist = ['*']
    fastify.register(cors, {
      origin: whitelist, // Cho phép tất cả các domain gọi API
      credentials: true // Cho phép trình duyệt gửi cookie đến server
    })

    fastify.register(fastifyAuth, {
      defaultRelation: 'and'
    })
    fastify.register(fastifyHelmet, {
      crossOriginResourcePolicy: {
        policy: 'cross-origin'
      }
    })
    fastify.register(fastifyCookie)
    fastify.register(validatorCompilerPlugin)
    fastify.register(errorHandlerPlugin)
    fastify.register(fastifySocketIO, {
      cors: {
        // origin: 'https://pr-qlqa.vercel.app/'
        // origin: 'http://localhost:3000'
        origin: ['https://pr-qlqa.vercel.app', 'http://localhost:3000']
      }
    })
    fastify.register(socketPlugin)
    fastify.register(authRoutes, {
      prefix: '/auth'
    })
    fastify.register(accountRoutes, {
      prefix: '/accounts'
    })
    fastify.register(mediaRoutes, {
      prefix: '/media'
    })
    fastify.register(staticRoutes, {
      prefix: '/static'
    })
    fastify.register(dishRoutes, {
      prefix: '/dishes'
    })
    fastify.register(tablesRoutes, {
      prefix: '/tables'
    })
    fastify.register(orderRoutes, {
      prefix: '/orders'
    })
    fastify.register(testRoutes, {
      prefix: '/test'
    })
    fastify.register(guestRoutes, {
      prefix: '/guest'
    })
    await initOwnerAccount()
    await fastify.listen({
      port: envConfig.PORT,
      host: '0.0.0.0'
    })
    console.log(`Server đang chạy: ${API_URL}`)
    await keepServerAlive(fastify)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
