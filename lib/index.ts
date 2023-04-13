"use strict";
import { IMlclDatabase } from "@molecuel/core";
import { injectable } from "@molecuel/di";
import * as _ from "lodash";
import { Db, MongoClient, ObjectId } from "mongodb";

@injectable
export class MlclMongoDb implements IMlclDatabase {
  public static readonly idPattern = "_id";

  public readonly type = "MlclMongoDb";
  private ownDb: Db;
  constructor (private readonly ownConnectionUri: string) {}

  public async connect (): Promise<Db | Error> {
    try {
      const client = await MongoClient.connect(this.ownConnectionUri);
      this.ownDb = client.db();
      return await Promise.resolve(this.ownDb);
    } catch (e) {
      return await Promise.reject(e);
    }
  }

  /**
   * @description Returns the private database connection
   *
   * @memberOf MlclMongoDb
   */
  public get database (): Db {
    // let frozenDb = this.deepFreeze(this.ownDb);
    return this.ownDb;
  }

  public async save (document: Object, collectionName: string, upsert: boolean = false): Promise<any> {
    const update: any = _.cloneDeep(document);
    const query = {};
    const idPattern = (this as any).idPattern || (this as any).constructor.idPattern;
    delete update.id;
    delete update._id;
    delete update[idPattern];
    const saved = _.cloneDeep(update);
    query[idPattern] = this.autoresolveStringId(document[idPattern]);
    let response;
    for (const prop in update) {
      if (Reflect.has(update, prop)) {
        update[prop] = this.autoresolveStringId(update[prop]);
      }
    }
    try {
      if (!(query[idPattern]) && upsert) {
        response = await (this.ownDb.collection(collectionName)).insertOne(update);
      } else {
        response = await (this.ownDb.collection(collectionName)).updateOne(query, { $set: update }, { upsert });
      }
      saved[idPattern] = this.autoresolveObjectId(response.insertedId ? response.insertedId : query[idPattern]);
      return await Promise.resolve(saved);
    } catch (e) {
      return await Promise.reject(e);
    }
  }

  public async update (query: Object, update: Object, collectionName: string): Promise<any> {
    const idPattern = (this as any).idPattern || (this as any).constructor.idPattern;
    if (query[idPattern]) {
      query[idPattern] = this.autoresolveStringId(query[idPattern]);
    }
    try {
      const saved = await (this.ownDb.collection(collectionName)).updateOne(query, { $set: update });
      return await Promise.resolve((saved as any).result ? (saved as any).result : saved);
    } catch (e) {
      return await Promise.reject(e);
    }
  }

  public async updateMany (query: Object, update: Object, collectionName: string): Promise<any> {
    const options: any = {};
    options.multi = true;
    try {
      const saved = await (await this.ownDb.collection(collectionName)).updateMany(query, update, options);
      return await Promise.resolve((saved as any).result ? (saved as any).result : saved);
    } catch (e) {
      return await Promise.reject(e);
    }
  }

  public async find (query: Object, collectionName: string): Promise<any> {
    const idPattern = (this as any).idPattern || (this as any).constructor.idPattern;
    try {
      if (query) {
        query = this.autoresolveStringId(query);
      }
      const response = await (await this.ownDb.collection(collectionName)).find(query);
      const result = _.each(await response.toArray(), (item: any) => {
        item[idPattern] = item._id;
        if (idPattern !== "_id") {
          delete item._id;
        }
        this.autoresolveObjectId(item);
      });
      return await Promise.resolve(result);
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public async findOne (query: object, collectionName: string): Promise<any> {
    const idPattern = (this as any).idPattern || (this as any).constructor.idPattern;
    try {
      if (query) {
        query = this.autoresolveStringId(query);
      }
      const response = await (await this.ownDb.collection(collectionName)).find(query);
      const result = await response.next();
      result[idPattern] = result._id;
      if (idPattern !== "_id") {
        delete result._id;
      }
      return await Promise.resolve(result);
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public async remove (query: object, collectionName: string) {
    const idPattern = (this as any).idPattern || (this as any).constructor.idPattern;
    try {
      if (query) {
        query = this.autoresolveStringId(query);
      }
      const response = await (await this.ownDb.collection(collectionName)).deleteMany(query);
      return await Promise.resolve(response.deletedCount);
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public async dropCollection (collectionName: string): Promise<any> {
    try {
      const response = await this.ownDb.dropCollection(collectionName);
      return await Promise.resolve(response);
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  public async listCollections (): Promise<any> {
    try {
      const response = await this.ownDb.listCollections().toArray();
      return await Promise.resolve(response);
    } catch (error) {
      return await Promise.reject(error);
    }
  }

  protected deepFreeze (obj: Object, depth?: number) {
    if (typeof depth === "undefined") {
      depth = 5;
    }
    const keys = Object.keys(obj);
    for (const prop in obj) {
      if (_.includes(keys, prop)) {
        if (depth > 0 &&
          (typeof obj[prop] === "object" || typeof obj[prop] === "function") &&
          obj[prop] !== null && obj[prop] !== undefined) {
          depth--;
          this.deepFreeze(obj[prop], depth);
        }
      }
    }
    return Object.freeze(obj);
  }

  /**
   * Recursively auto-resolves string IDs to ObjectIDs.
   * @param id The ID to auto-resolve.
   */
  protected autoresolveStringId (id: any): any {
    if (typeof id === "string" && id.length === 24 &&
      id.match(/^[0-9a-fA-F]{24}$/) && ObjectId.isValid(new ObjectId(id))) {
      id = new ObjectId(id);
    } else if (_.isArray(id)) {
      for (const entry in id) {
        if (Reflect.has(id, entry)) {
          id[entry] = this.autoresolveStringId(id[entry]);
        }
      }
    } else if (typeof id === "object") {
      for (const prop in id) {
        if (Reflect.has(id, prop)) {
          id[prop] = this.autoresolveStringId(id[prop]);
        }
      }
    }
    return id;
  }

  protected autoresolveObjectId (id: any): any {
    if (id instanceof ObjectId) {
      id = id.toString();
    } else if (_.isArray(id)) {
      for (const entry in id) {
        if (Reflect.has(id, entry)) {
          id[entry] = this.autoresolveObjectId(id[entry]);
        }
      }
    } else if (typeof id === "object") {
      for (const prop in id) {
        if (Reflect.has(id, prop)) {
          id[prop] = this.autoresolveObjectId(id[prop]);
        }
      }
    }
    return id;
  }
}
