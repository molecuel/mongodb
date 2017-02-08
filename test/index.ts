'use strict';
import 'reflect-metadata';
import should = require('should');
import assert = require('assert');
import {MlclMongoDb} from '../dist';
import {di, injectable} from '@molecuel/di';
import {Subject, Observable} from '@reactivex/rxjs';
should();

describe('mongodb', function() {
  before(() => {
    di.bootstrap(MlclMongoDb);
  });
  let db;
  describe('init', function() {
    it('should not connect', async function() {
      let connection;
      db = di.getInstance('MlclMongoDb', 'herpderp');
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
  }); // category end
  describe('interaction', function() {
    const VEHICLE_COLLECTION = 'vehicle_test';
    const ENGINE_COLLECTION = 'engine_test';
    let testCar = {
      id: 1,
      model: 'C4',
      make: 'Aston Maaaartin',
      engine: 1
    };
    let testTruck = {
      id: 2,
      model: 'BRMM',
      make: 'STAB',
      engine: 4
    };
    it('should not save a new document (no collection supplied)', async function() {
      try {
        let response = await db.save(testCar);
        should.not.exist(response);
      } catch (error) {
        should.exist(error);
      }
    });
    it('should save a new document (in its collection)', async function() {
      try {
        let response = await db.save(testCar, VEHICLE_COLLECTION);
        should.exist(response);
      } catch (error) {
        should.not.exist(error);
      }
    });
    it('should not find any saved document (no collection supplied)', async function() {
      try {
        let response = await db.findOne({_id: testCar.id});
        should.not.exist(response);
      } catch (error) {
        should.exist(error);
      }
      try {
        let response = await db.find({_id: testCar.id});
        should.not.exist(response);
      } catch (error) {
        should.exist(error);
      }
    });
    it('should find the single saved document (in its collection)', async function() {
      try {
        let response = await db.findOne({_id: testCar.id}, VEHICLE_COLLECTION);
        should.exist(response);
      } catch (error) {
        should.not.exist(error);
      }
    });
    it('should save another new document (in its collection)', async function() {
      try {
        let response = await db.save(testTruck, VEHICLE_COLLECTION);
        should.exist(response);
      } catch (error) {
        should.not.exist(error);
      }
    });
    it('should not update anything (no collection supplied)', async function() {
      let update = JSON.parse(JSON.stringify(testCar));
      update.engine = 2;
      try {
        let response = await db.update(testCar, update);
        should.not.exist(response);
      } catch (error) {
        should.exist(error);
      }
      try {
        let response = await db.updateMany({}, {$set: {engine: 3}});
        should.not.exist(response);
      } catch (error) {
        should.exist(error);
      }
    });
    it('should update a document (in its collection)', async function() {
      let update = JSON.parse(JSON.stringify(testCar));
      update.engine = 2;
      try {
        let response = await db.update(testCar, update, VEHICLE_COLLECTION);
        should.exist(response);
      } catch (error) {
        should.not.exist(error);
      }
    });
    it('should find all saved documents (in one collection)', async function() {
      try {
        let response = await db.find({}, VEHICLE_COLLECTION);
        should.exist(response);
      } catch (error) {
        should.not.exist(error);
      }
    });
    it('should update all saved documents (in one collection)', async function() {
      try {
        let response = await db.updateMany({}, {$set: {engine: 3}}, VEHICLE_COLLECTION);
        should.exist(response);
      } catch (error) {
        should.not.exist(error);
      }
    });
    it('should receive error when attemting to drop non-existent collecgion', async function() {
      try {
        let response = await db.dropCollection(ENGINE_COLLECTION);
        should.not.exist(response);
      } catch (error) {
        should.exist(error);
      }
    });
    after(async function () {
      try {
        await db.dropCollection(VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
    });
  }); // category end
}); // test end
