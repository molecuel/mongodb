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
  describe('init', function() {
    it('should connect', async function() {
      let connection;
      let db = di.getInstance('MlclMongoDb', 'mongodb://localhost/mongodb_test');
      try {
        connection = await db.connect();
        // console.log({db:db, connection: connection});
      }
      catch (e) {
        should.not.exist(e);
        // console.log({db: db, error: e});
      }
      db.should.be.instanceOf(MlclMongoDb);
      should.exist(connection);
    });
  }); // category end
  describe('interaction', function() {
    it('should save a new document (in its collection)', async function() {

    });
    it('should find the saved document (in its collection)', function() {

    });
    it('should save another new document (in its collection)', function() {

    });
    it('should update a document (in its collection)', function() {

    });
    it('should find all saved documents (in one collection)', function() {

    });
    it('should update all saved documents (in one collection)', function() {

    });
  }); // category end
}); // test end
