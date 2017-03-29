"use strict";
import {IMlclDatabase} from "@molecuel/core";
import {injectable} from "@molecuel/di";
import * as _ from "lodash";
import {Db, MongoClient, ObjectID} from "mongodb";

@injectable
export class MlclMongoDb implements IMlclDatabase {
  public get type(): string { return "MlclMongoDb"; }
  public static get idPattern(): string { return "_id"; };
  private ownDb: Db;
  constructor(private ownConnectionUri: string) {}

  public async connect(): Promise<Readonly<Object>|Error> {
    try {
      this.ownDb = await MongoClient.connect(this.ownConnectionUri);
      return Promise.resolve(this.database);
    } catch (e) {
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
    let frozenDb = this.deepFreeze(this.ownDb);
    return frozenDb;
  }

  public async save(document: Object, collectionName: string, upsert: boolean = false): Promise<any> {
    let update = JSON.parse(JSON.stringify(document));
    let query = {};
    let idPattern = (<any> this).idPattern || (<any> this).constructor.idPattern;
    delete update.id;
    delete update._id;
    delete update[idPattern];
    let saved = _.cloneDeep(update);
    query[idPattern] = document[idPattern];
    let response;
    try {
      if (!query[idPattern] && upsert) {
        response =  await (await this.ownDb.collection(collectionName)).insertOne(update);
      } else {
        response =  await (await this.ownDb.collection(collectionName)).updateOne(query, update, {upsert});
      }
      saved[idPattern] = response.insertedId ? response.insertedId : query[idPattern];
      return Promise.resolve(saved);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async update(query: Object, update: Object, collectionName: string): Promise<any> {
    try {
      let saved = await (await this.ownDb.collection(collectionName)).update(query, update);
      return Promise.resolve((<any> saved).result ? (<any> saved).result : saved);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async updateMany(query: Object, update: Object, collectionName: string): Promise<any> {
    let options: any = {};
    options.multi = true;
    try {
      let saved = await (await this.ownDb.collection(collectionName)).updateMany(query, update, options, null);
      return Promise.resolve((<any> saved).result ? (<any> saved).result : saved);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async find(query: Object, collectionName: string): Promise<any> {
    let idPattern = (<any> this).idPattern || (<any> this).constructor.idPattern;
    try {
      if (query && query[idPattern]) {
        query[idPattern] = this.autoresolveStringId(query[idPattern]);
      }
      let response = await (await this.ownDb.collection(collectionName)).find(query);
      let result = _.each(await response.toArray(), (item) => {
        item[idPattern] = item._id;
        if (idPattern !== "_id") {
          delete item._id;
        }
      });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async findOne(query: Object, collectionName: string): Promise<any> {
    let idPattern = (<any> this).idPattern || (<any> this).constructor.idPattern;
    try {
      if (query && query[idPattern]) {
        query[idPattern] = this.autoresolveStringId(query[idPattern]);
      }
      let response = await (await this.ownDb.collection(collectionName)).find(query);
      let result = await response.next();
      result[idPattern] = result._id;
      if (idPattern !== "_id") {
        delete result._id;
      }
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async dropCollection(collectionName: string): Promise<any> {
    try {
      let response = await this.ownDb.dropCollection(collectionName);
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  protected deepFreeze(obj: Object, depth?: number) {
    if (typeof depth === "undefined") {
      depth = 5;
    }
    let keys = Object.keys(obj);
    for (let prop in obj) {
      if (_.includes(keys, prop)) {
        if (depth > 0
          && (typeof obj[prop] === "object" || typeof obj[prop] === "function")
          && obj[prop] !== null && obj[prop] !== undefined) {
          depth--;
          this.deepFreeze(obj[prop], depth);
        }
      }
    }
    return Object.freeze(obj);
  }

  protected autoresolveStringId(id: any): any {
    if (typeof id === "string" && id.length === 24 && ObjectID.isValid(new ObjectID(id))) {
      id = new ObjectID(id);
    } else if (_.isArray(id)) {
      for (let entry of id) {
        this.autoresolveStringId(entry);
      }
    } else if (typeof id === "object") {
      for (let prop in id) {
        if (id[prop]) {
          this.autoresolveStringId(id[prop]);
        }
      }
    }
    return id;
  }
}
