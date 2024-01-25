import { ObjectId } from "mongodb";
import * as dataDB from "./database";
import { randomUUID } from "crypto";

export type Producer = {
  _id: string;
  name: string;
  country: string;
  region: string;
}

export type Product = {
  _id: string;
  name: string;
  vintage: string;
  producerId: string;
  producer: Producer;
}

const getProducer = (args: { _id: string }): Producer | undefined => {
  return dataDB.producers.find((producer) => producer._id === args._id);
};

const getProducerByIdFromMongoDB = async (args: { _id: string }): Promise<Producer | null> => {
  console.log(`getProducerByIdFromMongoDB _id:${args._id} and the length is ${args._id}`)
  const objectId = ObjectId.createFromHexString(args._id);
  console.log(`getProducerByIdFromMongoDB objectId:${objectId}`)
  await dataDB.client.connect();
  const db = dataDB.client.db(dataDB.dbName);
  const producersCollection = db.collection(dataDB.producersCollectionName);
  // Find the document by _id
  const document = await producersCollection.findOne({ _id: objectId });
  console.log(`getProducerByIdFromMongoDB: ${document}`)
  return document as Producer | null;
};  

const getProducers = (): Producer[] => {
  return dataDB.producers;
};

const getProducts = (): Product[] => {
  return dataDB.products.map(product => {
    return {
      _id: product._id,
      name: product.name,
      vintage: product.vintage,
      producerId: product.producerId,
      producer: dataDB.producers.find(producer => producer._id === product.producerId)
    } as Product
  });
};

//not working for the moment
//not continue since have to replace it with mongodb...
const getProductsByProducerId = (producerId: string): Product[] => {
  return dataDB.products.filter(product => product.producerId === producerId).map(product => {
    return {
      _id: product._id,
      name: product.name,
      vintage: product.vintage,
      producerId: product.producerId,
      producer: dataDB.producers.find(producer => producer._id === product.producerId)
    } as Product
  });
};

const getProductsByProducerIdFromMongoDB = async (producerId: string): Promise<Product[]> => {
  const objectId = ObjectId.createFromHexString(producerId);
  console.log(`getProducerByIdFromMongoDB objectId:${objectId}`)
  await dataDB.client.connect();
  const db = dataDB.client.db(dataDB.dbName);

  const productsCollection = db.collection('products');
  const producersCollection = db.collection('producers');

  const aggregationResult = await productsCollection.aggregate([
    {
      $match: {
        producerId: objectId,
      },
    },
    {
      $lookup: {
        from: 'producers',
        localField: 'producerId',
        foreignField: '_id',
        as: 'producer',
      },
    },
    {
      $unwind: '$producer',
    },
    {
      $project: {
        _id: 1,
        name: 1,
        producer: {
          _id: 1,
          name: 1,
        },
      },
    },
  ]).toArray();

  return aggregationResult.map(mapProduct);
};

// Mapping function for Product entity
const mapProduct = (rawProduct: any): Product => {
  return {
    _id: rawProduct._id.toString(),
    name: rawProduct.name,
    vintage: rawProduct.vintage,
    producerId: rawProduct.producerId,
    producer: mapProducer(rawProduct.producer)
  } as Product;
};

// Mapping function for Producer entity
const mapProducer = (rawProducer: any): Producer => {
  return {
    _id: rawProducer._id.toString(),
    name: rawProducer.name,
    country: rawProducer.country,
    region: rawProducer.region
  } as Producer;
};

const createProducer = (args: {
  producer: {
    name: string;
    country: string;
    region: string;
  }
}): Producer => {
  // generate randon uuid for producer object
  const generatedId = randomUUID().toString();
  // create producer object and save
  const producer = { _id: generatedId, ...args.producer };
  dataDB.producers.push(producer);
  return producer;
};

const createProducerInMongoDB = async (args: {
  producer: {
    name: string;
    country: string;
    region: string;
  }
}): Promise<Producer> => {
  // generate randon uuid for producer object
  const generatedId = randomUUID().toString();
  // create producer object and save
  const producer = { _id: generatedId, ...args.producer };
  let result;
  try{
    console.log("*** createProducerInMongoDB connect")
    await dataDB.client.connect();
    const db = dataDB.client.db(dataDB.dbName);
    const producersCollection = db.collection(dataDB.producersCollectionName);
    // Insert producer data
    console.log("*** createProducerInMongoDB insert")
    result = await producersCollection.insertOne({
      name: producer.name, country: producer.country, region: producer.region
    })
  }finally{
    console.log("*** createProducerInMongoDB disconnect")
    await dataDB.dicsonnect();
  }

  return {
    _id: result.insertedId.toString(),
    name: producer.name,
    country: producer.country,
    region: producer.region,
  } as Producer;
};

const createProducts = (args: {
  products: [{
    name: string;
    vintage: string;
    producerId: string;
    producer?: Producer;
  }]
}): Product[] => {
  const result: Product[] = [];
  console.log(`***${JSON.stringify(args)}`)
  args.products.map(product => {
    console.log(`***producers: ${JSON.stringify(dataDB.producers)}`)
    const producer: Producer | undefined = dataDB.producers.find(producer => producer._id === product.producerId);
    console.log(`***producer: ${JSON.stringify(producer)}`)
    product.producer = producer;
    // generate randon uuid for producer object
    const generatedId = randomUUID().toString();
    // create producer object and save
    const productT: Product = { _id: generatedId, ...product } as Product;
    dataDB.products.push(productT);
    result.push(productT);
  })

  return result;
};

const createProductsInMongoDB = async (args: [{
    name: string;
    vintage: string;
    producerId: string;
    producer?: Producer;
  }]
): Promise<Product[]> => {
  // console.log("*** createProductsIMongoDB connect")
  // await dataDB.client.connect();
  // const db = dataDB.client.db(dataDB.dbName);
  // const productsCollection = db.collection(dataDB.productsCollectionName);
  // let result;
  // let insertedProducts: any[] = [];
  // try{
  //   console.log("*** createProducerInMongoDB insert")
  //   result = await productsCollection.insertMany(args)
  //   console.log(`***reulst: ${result.insertedIds}`)
  //   insertedProducts = await productsCollection.find({
  //   }).toArray();
  // }finally{
  //   console.log("*** createProductsIMongoDB disconnect")
  //   await dataDB.dicsonnect();
  // }
  // return insertedProducts.map(mapProduct);
  const product: Product = {
    name:"name",
    vintage:"vintage",
  } as Product;
  return [product];
};

export const root = {
  createProducer,
  createProducerInMongoDB,
  createProducts,
  createProductsInMongoDB,

  getProductsByProducerId,
  getProducer,
  getProducers,
  getProducts,
  getProducerByIdFromMongoDB,
  getProductsByProducerIdFromMongoDB
};
