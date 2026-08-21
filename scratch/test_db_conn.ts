import mongoose from 'mongoose'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const uri = "mongodb+srv://gmohammedaffan2004_db_user:affan2004@cluster0.brburcb.mongodb.net/lumina_skin?retryWrites=true&w=majority"

async function test() {
  console.log('Connecting to Atlas...')
  const t0 = Date.now()
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  console.log(`Connected in ${Date.now() - t0}ms!`)
  
  const count = await mongoose.connection.db?.collection('products').countDocuments()
  console.log(`Products in DB: ${count}`)
  
  const user = await mongoose.connection.db?.collection('users').findOne({ email: 'user@bareo.in' })
  console.log('User found:', user?.email, user?.role)

  await mongoose.disconnect()
}

test().catch(console.error)
