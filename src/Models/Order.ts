import mongoose, {Schema, Document} from 'mongoose'

if(process.env.MONGOLAB_URI){
  mongoose.connect(process.env.MONGOLAB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log(`MongoDB Connected sucessfully`))
    .catch(error => console.error(error))
}
export interface IOrder extends Document {
  products: [string],
  userId: string,
  userEmail: string,
  address: string,
  orderId?: string
}

const OrderSchema = new Schema({
  products: {type: [String], required: true},
  userId: {type: String, required: true},
  userEmail: {type: String, required: true},
  address: {type: String, required: true},
  orderId: {type: String}
})

const Order = mongoose.model<IOrder>('Order', OrderSchema)

export default Order
