import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { Product } from '../server/src/models/Product.model'
import { productService } from '../server/src/services/product/product.service'

dotenv.config({ path: path.resolve('server/.env') })

async function testSearchDirect() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lumina_skin'
  await mongoose.connect(uri)

  console.log('--- Testing ProductService.getProducts direct ---')
  const res = await productService.getProducts({ search: 'moisturizer' })
  console.log('Result count for "moisturizer":', res.total)
  console.log('Items found:', res.items.map((i: any) => ({ name: i.name, tags: i.tags, desc: i.shortDescription })))

  await mongoose.disconnect()
}

testSearchDirect().catch(console.error)
