const fs = require('fs').promises;
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');
const { Transform, pipeline } = require('stream');
const { promisify } = require('util');
export * as db from "./database"

class CsvToMongoBatchProcessor {
  constructor(csvFilePath, batchSize = 100) {
    this.csvFilePath = csvFilePath;
    this.batchSize = batchSize;
  }

  async connectToMongo() {
    await db.connect();
    return db.fr_db();
  }

  transformData(record) {
    // Example: Convert the 'name' field to uppercase
    return { ...record, name: record.name.toUpperCase() };
  }

  async writeToMongo(data) {
    const collection = db.fr_db().collection(db.productsCollectionName);
    await collection.insertMany(data);
  }

  async createPipeline() {
    const readStream = fs.createReadStream(this.csvFilePath).pipe(csv()); // Read from CSV

    const transformData = new Transform({
      objectMode: true,
      transform: this.transformData.bind(this),
    });

    const batchTransform = new Transform({
      objectMode: true,
      transform: this.batchTransform.bind(this),
      flush: this.batchFlush.bind(this),
    });

    const writeToMongoTransform = new Transform({
      objectMode: true,
      transform: async (batch, encoding) => {
        const client = await this.connectToMongo();
        await this.writeToMongo(client, batch);
        client.close();
      },
    });

    try {
      await promisify(pipeline)(
        readStream,
        transformData,
        batchTransform,
        writeToMongoTransform
      );
      console.log('Pipeline succeeded.');
    } catch (err) {
      console.error('Pipeline failed.', err);
    }
  }

  batchTransform(chunk, encoding, callback) {
    this.batch = this.batch || [];
    this.batch.push(chunk);

    if (this.batch.length === this.batchSize) {
      this.push([...this.batch]);
      this.batch = [];
    }

    callback();
  }

  batchFlush(callback) {
    if (this.batch.length > 0) {
      this.push([...this.batch]);
    }
    callback();
  }

  async run() {
    await this.createPipeline();
  }
}

// Example usage
const processor = new CsvToMongoBatchProcessor('URL_TO_CSV');
processor.run();
