'use strict';
import {injectable} from '@molecuel/di';
import {MongoClient, Db} from 'mongodb';
import {IMlclDatabase} from '@molecuel/database';

@injectable
export class MlclMongoDb implements IMlclDatabase {
  private _database: Db;
  private _connectionurl: string;
  constructor() {}

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

  public save(document: Object) {
    console.log(this._database);
  }

  public update(document: Object) {
  }
}
