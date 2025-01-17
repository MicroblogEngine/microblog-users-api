import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import pinoHttp from 'pino-http' 

 
const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, turbo: true })
const handle = app.getRequestHandler()
const logger = pinoHttp()
 
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    logger(req, res)
    handle(req, res, parsedUrl)
  }).listen(port)
 
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  )
})