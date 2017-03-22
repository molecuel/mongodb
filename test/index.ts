'use strict';
import 'reflect-metadata';
import * as should from 'should';
import * as assert from 'assert';
import {MlclMongoDb} from '../dist';
import {di, injectable} from '@molecuel/di';
import {Subject, Observable} from '@reactivex/rxjs';

describe('mongodb', function() {
  before(() => {
    di.bootstrap(MlclMongoDb);
  });
  let db;
  describe('init', function() {
    it('should not connect', async function() {
      let connection;
      db = di.getInstance('MlclMongoDb', 'herpderp');
      db.type.should.equal('MlclMongoDb');
      try {
        connection = await db.connect();
      }
      catch (e) {
        should.exist(e);
      }
      db.should.be.instanceOf(MlclMongoDb);
      should.not.exist(connection);
    });
    it('should connect', async function() {
      let connection;
      db = di.getInstance('MlclMongoDb', 'mongodb://localhost/mongodb_test');
      try {
        connection = await db.connect();
      }
      catch (e) {
        should.not.exist(e);
      }
      db.should.be.instanceOf(MlclMongoDb);
      should.exist(connection);
    });
    it('should not be possible to modify readonly Db', function () {
      try {
        db.database.s.databaseName = 'labor_test';
        db.database.domain = 'labor';
        db.database.s.databaseName.should.not.equal('labor_test');
        db.database.domain.should.not.equal('labor');
      } catch (error) {
        should.exist(error);
      }
    });
  }); // category end
  describe('interaction', function() {
    const VEHICLE_COLLECTION = 'vehicle_test';
    const ENGINE_COLLECTION = 'engine_test';
    let testCar = {
      _id: undefined,
      model: 'C4',
      make: 'Aston Martiiiiin',
      engine: 1
    };
    let testTruck = {
      model: 'BRMM',
      make: 'STAB',
      engine: 4
    };
    it('should not save a new document (no collection supplied)', async function() {
      let response;
      try {
        response = await db.save(testCar);
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    it('should save a new document (in its collection)', async function() {
      let response;
      try {
        response = await db.save(testCar, VEHICLE_COLLECTION, true);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      testCar._id = response._id;
    });
    it('should not find any saved document (no collection supplied)', async function() {
      let response;
      try {
        response = await db.findOne({_id: testCar._id});
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
      try {
        response = await db.find({_id: testCar._id});
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    it('should find the single saved document (in its collection)', async function() {
      let response;
      let idString = testCar._id.toString();
      idString.should.be.type('string');
      try {
        response = await db.findOne({_id: idString}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should find the saved document by autoresolving a ObjectID string', async function() {
      let response;
      try {
        response = await db.findOne({_id: testCar._id.toString()}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      try {
        response = await db.find({_id: testCar._id.toString()}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should save another new document (in its collection)', async function() {
      let response;
      try {
        response = await db.save(testTruck, VEHICLE_COLLECTION, true);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should not update anything (no collection supplied)', async function() {
      let update = JSON.parse(JSON.stringify(testCar));
      delete update._id;
      update.engine = 2;
      let response;
      try {
        response = await db.update(testCar, update);
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
      try {
        response = await db.updateMany({}, {$set: {engine: 3}});
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    it('should update a document (in its collection)', async function() {
      let update = JSON.parse(JSON.stringify(testCar));
      delete update._id;
      update.engine = 2;
      let response;
      try {
        response = await db.update(testCar, update, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should find all saved documents (in one collection)', async function() {
      let response;
      try {
        response = await db.find({}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should update all saved documents (in one collection)', async function() {
      let response;
      try {
        response = await db.updateMany({}, {$set: {engine: 3}}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should be able to drop a collection', async function() {
      let response;
      try {
        response = await db.dropCollection(VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it('should receive error when attempting to drop non-existent collection', async function() {
      let response;
      try {
        response = await db.dropCollection(ENGINE_COLLECTION);
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    after(async function () {
      try {
        await db.database.dropDatabase();
      } catch (error) {
        should.not.exist(error);
      }
    });
  }); // category end
}); // test end
