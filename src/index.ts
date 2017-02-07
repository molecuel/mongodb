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
      return this._database;
    } catch(e) {
      return e;
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

  public async save(document: Object, collection: string): Promise<any> {
    // console.log(this._database);
    let update = JSON.parse(JSON.stringify(document));
    delete update.id;
    try {
      if (!this.database[collection]) {
        let collres = await this.database.createCollection(collection);
        console.log(collres);
      }
      let saved = await this.database[collection].update({id: (<any>document).id}, update, {upsert: true});
      return Promise.resolve(saved);
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  public update(document: Object) {
  }

  public find(query: Object) {

  }
}
