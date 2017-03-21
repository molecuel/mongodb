'use strict';
import {injectable} from '@molecuel/di';
import {MongoClient, Db, ObjectID} from 'mongodb';
import * as _ from 'lodash';
import {IMlclDatabase} from '@molecuel/core';

@injectable
export class MlclMongoDb implements IMlclDatabase {
  public get type(): string { return 'MlclMongoDb'; }
  public static get idPattern(): string { return '_id'; };
  private _database: Db;
  // private _connectionurl: string;
  constructor(private _connectionurl: string) {}

  public async connect(): Promise<Readonly<Object>|Error> {
    try {
      this._database = await MongoClient.connect(this._connectionurl);
      return Promise.resolve(this.database);
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
    let frozenDb = this.deepFreeze(this._database);
    return frozenDb;
  }

  protected deepFreeze(obj: Object, depth?: number) {
    if (typeof depth === 'undefined') {
      depth = 5;
    }
    let keys = Object.keys(obj);
    for (let prop in obj) {
      if (_.includes(keys, prop)) {
        if (depth > 0 && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && obj[prop] !== null && obj[prop] !== undefined) {
          depth--;
          this.deepFreeze(obj[prop], depth);
        }
      }
    }
    return Object.freeze(obj);
  }

  public async save(document: Object, collectionName: string): Promise<any> {
    let update = JSON.parse(JSON.stringify(document));
    let query = {};
    let idPattern = (<any>this).idPattern || (<any>this).constructor.idPattern;
    delete update.id;
    delete update._id;
    delete update[idPattern];
    let saved = _.cloneDeep(update);
    query[idPattern] = document[idPattern];
    let response;
    try {
      if (!query[idPattern]) {
        response =  await (await this._database.collection(collectionName)).insertOne(update);
      }
      else {
        response =  await (await this._database.collection(collectionName)).updateOne(query, update, {upsert: true});
      }
      saved[idPattern] = response.insertedId ? response.insertedId : query[idPattern];
      return Promise.resolve(saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async update(query: Object, update: Object, collectionName: string): Promise<any> {
    try {
      let saved = await (await this._database.collection(collectionName)).update(query, update);
      return Promise.resolve((<any>saved).result ? (<any>saved).result : saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async updateMany(query: Object, update: Object, collectionName: string): Promise<any> {
    let options: any = {};
    options.multi = true;
    try {
      let saved = await (await this._database.collection(collectionName)).updateMany(query, update, options, null);
      return Promise.resolve((<any>saved).result ? (<any>saved).result : saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async find(query: Object, collectionName: string): Promise<any> {
    let idPattern = (<any>this).idPattern || (<any>this).constructor.idPattern;
    if (query && typeof query[idPattern] === 'string' && ObjectID.isValid(new ObjectID(query[idPattern]))) {
        query[idPattern] = new ObjectID(query[idPattern]);
    }
    try {
      let response = await (await this._database.collection(collectionName)).find(query);
      let result = _.each(await response.toArray(), (item) => {
        item[idPattern] = item._id;
        delete item._id;
      });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async findOne(query: Object, collectionName: string): Promise<any> {
    let idPattern = (<any>this).idPattern || (<any>this).constructor.idPattern;
    if (query && typeof query[idPattern] === 'string' && ObjectID.isValid(new ObjectID(query[idPattern]))) {
        query[idPattern] = new ObjectID(query[idPattern]);
    }
    try {
      let response = await (await this._database.collection(collectionName)).find(query);
      let result = await response.next();
      result[idPattern] = result._id;
      delete result._id;
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async dropCollection(collectionName: string): Promise<any> {
    try {
      let response = await this._database.dropCollection(collectionName);
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
