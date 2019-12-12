import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import Producer from 'sqs-producer'
import * as dotenv from 'dotenv'
import * as EmailValidator from 'email-validator'

dotenv.config()

import Order, { IOrder } from './models/Order'

const queue = process.env.QUEUE_ENDPOINT || ''
const region = process.env.QUEUE_REGION || ''
const accessKey = process.env.ACCESS_KEY || ''
const secretKey = process.env.SECRET_KEY || ''

const producer = Producer.create({
  queueUrl: queue,
  region: region,
  accessKeyId: accessKey,
  secretAccessKey: secretKey
});

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/', (_, res) => {
  res.json({ foo: 'bar' })
})


// Validate the data
app.post('/orders', (req, res, next) => {
  const { products, userId, userEmail, address } = req.body
  if (!Array.isArray(products)) {
    res.json({ type: 'Error', message: 'You should provide an array of products' })
    return
  }

  if (products.length == 0) {
    res.json({ type: 'Error', message: 'There are no items in your basket' })
    return
  }

  if (userId === '') {
    res.json({ type: 'Error', message: 'Your request does not have any User ID provided' })
    return
  }

  if (!EmailValidator.validate(userEmail)) {
    res.json({ type: 'Error', message: 'The provided email is not valid' })
    return
  }

  if (address == '') {
    res.json({ type: 'Error', message: 'Please provide a valid address' })
    return
  }

  next()
})

// Add the order to the database
app.post('/orders', (req, res) => {
  let createdOrder = new Order(req.body)

  createdOrder.orderId = createdOrder['_id']

  createdOrder.save()
    .then((order: IOrder) => {
      if (order.orderId !== undefined)
        producer.send(order.orderId, (err) => {
          if (err) console.error(err)
        })

      res.json({
        type: 'Success',
        message: `Order ${order.id} created successfully`
      })
    })
    .catch((error: any) => console.error(error))
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`)
})