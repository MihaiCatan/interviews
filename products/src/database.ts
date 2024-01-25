import { ConnectOptions, Db, MongoClient } from "mongodb";
import { Producer, Product } from "./resolvers";

export const dbName = 'fr_db';
export const url = 'mongodb://root:example@localhost:27017';
export const client = new MongoClient(url);
export const producersCollectionName = "producers";
export const productsCollectionName = "products";

export const connect = async function connectToMongoDB() {
    try {
      console.log('Connecting to MongoDB');
      await client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

export const init = async function init(){
    console.log(`*** init create producers collection`)
    // Producer Collection
    client.db(dbName).createCollection("producers")

    console.log(`*** init create products collection`)
    // Product Collection
    client.db(dbName).createCollection("products")
}

export const dicsonnect = async function disconnectFromMongoDB() {
    try {
      await client.close();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

export const fr = (): Db => {
    return client.db()
}

const producers: Producer[] = [];
const products: Product[] = [];
export { producers, products };
