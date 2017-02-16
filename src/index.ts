'use strict';
import {injectable} from '@molecuel/di';
import {MongoClient, Db} from 'mongodb';
import * as _ from 'lodash';
import {IMlclDatabase} from '@molecuel/database';

@injectable
export class MlclMongoDb implements IMlclDatabase {
  public static get type(): string { return 'MlclMongoDb'; }
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
    delete update.id;
    delete update._id;
    let query = {};
    try {
      let idPattern = (<any>this).idPattern || (<any>this).constructor.idPattern;
      query[idPattern] = document[idPattern];
      let saved = await (await this._database.collection(collectionName)).updateOne(query, update, {upsert: true});
      return Promise.resolve(saved.result ? saved.result : saved);
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
    try {
      let options: any = {};
      options.multi = true;
      let saved = await (await this._database.collection(collectionName)).updateMany(query, update, options, null);
      return Promise.resolve((<any>saved).result ? (<any>saved).result : saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public async find(query: Object, collectionName: string): Promise<any> {
    try {
      let response = await (await this._database.collection(collectionName)).find(query);
      return Promise.resolve(response.toArray());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async findOne(query: Object, collectionName: string): Promise<any> {
    try {
      let response = await (await this._database.collection(collectionName)).find(query);
      return Promise.resolve(response.next());
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
