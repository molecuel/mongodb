'use strict';
import {injectable} from '@molecuel/di';
import {MongoClient, Db} from 'mongodb';
import {IMlclDatabase} from '@molecuel/database';

@injectable
export class MlclMongoDb implements IMlclDatabase {
  private _database: Db;
  // private _connectionurl: string;
  constructor(private _connectionurl: string) {}

  public async connect(): Promise<Db|Error> {
    try {
      this._database = await MongoClient.connect(this._connectionurl);
      return Promise.resolve(this._database);
    } catch(e) {
      return Promise.reject(e);
    }
  }

  /**
   * @description Returns the private database connection
   * @readonly
   *
   * @memberOf MlclMongoDb
   */
  public get database() {
    return this._database;
  }

  public async save(document: Object, collectionName: string): Promise<any> {
    // console.log(this._database);
    let update = JSON.parse(JSON.stringify(document));
    delete update.id;
    try {
      let saved = await (await this.database.collection(collectionName)).updateOne({_id: (<any>document).id}, update, {upsert: true});
      return Promise.resolve(saved.result ? saved.result : saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async update(query: Object, update: Object, collectionName: string): Promise<any> {
    try {
      let saved = await (await this.database.collection(collectionName)).update(query, update);
      return Promise.resolve((<any>saved).result ? (<any>saved).result : saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async updateMany(query: Object, update: Object, collectionName: string): Promise<any> {
    try {
      let options: any = {};
      options.multi = true;
      let saved = await (await this.database.collection(collectionName)).updateMany(query, update, options, null);
      return Promise.resolve((<any>saved).result ? (<any>saved).result : saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async find(query: Object, collectionName: string): Promise<any> {
    try {
      let response = await (await this.database.collection(collectionName)).find(query);
      return Promise.resolve(response.toArray());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async findOne(query: Object, collectionName: string): Promise<any> {
    try {
      let response = await (await this.database.collection(collectionName)).find(query);
      return Promise.resolve(response.next());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async dropCollection(collectionName: string): Promise<any> {
    try {
      let response = await this.database.dropCollection(collectionName);
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}