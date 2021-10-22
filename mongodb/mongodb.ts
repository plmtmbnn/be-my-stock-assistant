import { MongoClient } from 'mongodb';

var mongodb: any;

export class MongoDbConnection {
  async init (): Promise<void> {
    try {
      const connectionString: string = 'mongodb://ukoinzfl5drlpzyvc1zi:wCScbUigwZdEa7M4mWdz@b7xcu7fgmqhkfnw-mongodb.services.clever-cloud.com:27017/b7xcu7fgmqhkfnw';
      const client:MongoClient = new MongoClient(connectionString);
      client.connect();
      mongodb = client.db('b7xcu7fgmqhkfnw');
      console.log('MongoDb is connected.');
    } catch (error) {
      console.log(error);
    }
  }

  async findCollection (collectionName: string, value: any): Promise<any> {
    const collection = mongodb.collection(collectionName);
    const findResult = await collection.find({ ...value }).toArray();
    return findResult;
  }

  async insertOneCollection (collectionName: string, value: any): Promise<any> {
    const collection = mongodb.collection(collectionName);
    const findResult = await collection.insertOne({ ...value });
    return findResult;
  }

  async insertManyCollection (collectionName: string, value: any[]): Promise<any> {
    const collection = mongodb.collection(collectionName);
    const findResult = await collection.insertMany([...value]);
    return findResult;
  }

  async deleteCollection (collectionName: string, value: any): Promise<any> {
    const collection = mongodb.collection(collectionName);
    const findResult = await collection.deleteMany({ ...value });
    return findResult;
  }

  async findAllCollection (collectionName: string): Promise<any> {
    const collection = mongodb.collection(collectionName);
    const findResult = await collection.find({}).toArray();
    return findResult;
  }
}
