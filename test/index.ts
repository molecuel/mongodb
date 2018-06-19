"use strict";
import {di} from "@molecuel/di";
import "reflect-metadata";
import {MlclMongoDb} from "../lib";

import * as chai from "chai";
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;
// tslint:disable:object-literal-sort-keys

describe("mongodb", () => {
  before(() => {
    di.bootstrap(MlclMongoDb);
  });
  let db;
  describe("init", () => {
    it("should not connect", async () => {
      let connection;
      db = di.getInstance("MlclMongoDb", "herpderp");
      db.type.should.equal("MlclMongoDb");
      try {
        connection = await db.connect();
      } catch (e) {
        should.exist(e);
      }
      db.should.be.instanceOf(MlclMongoDb);
      should.not.exist(connection);
    });
    it("should connect", async () => {
      let connection;
      db = di.getInstance("MlclMongoDb", "mongodb://localhost/mongodb_test");
      try {
        connection = await db.connect();
      } catch (e) {
        should.not.exist(e);
      }
      db.should.be.instanceOf(MlclMongoDb);
      should.exist(connection);
    });
    // it("should not be possible to modify readonly Db", () => {
    //   try {
    //     db.database.s.databaseName = "labor_test";
    //     db.database.domain = "labor";
    //     db.database.s.databaseName.should.not.equal("labor_test");
    //     db.database.domain.should.not.equal("labor");
    //   } catch (error) {
    //     should.exist(error);
    //   }
    // });
  }); // category end
  describe("interaction", () => {
    const VEHICLE_COLLECTION = "vehicle_test";
    const ENGINE_COLLECTION = "engine_test";
    const testCar = {
      engine: 1,
      _id: undefined,
      make: "Aston Martiiiiin",
      model: "C4" };
    const testTruck = {
      engine: 4,
      make: "STAB",
      model: "BRMM" };
    const testTruck2 = {
      engine: 4,
      make: "BATS",
      model: "WHHE" };
    it("should not save a new document (no collection supplied)", async () => {
      let response;
      try {
        response = await db.save(testCar);
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    it("should save a new document (in its collection)", async () => {
      let response;
      try {
        response = await db.save(testCar, VEHICLE_COLLECTION, true);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      testCar._id = response._id;
    });
    it("should not find any saved document (no collection supplied)", async () => {
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
    it("should find the single saved document (in its collection)", async () => {
      let response;
      let idString = testCar._id.toString();
      idString.should.be.a("string");
      try {
        response = await db.findOne({_id: idString}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it("should find the saved document by autoresolving a ObjectID string", async () => {
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
    it("should save some more documents (in their collection)", async () => {
      let response;
      try {
        response = await db.save(testTruck, VEHICLE_COLLECTION, true);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      try {
        response = await db.save(testTruck2, VEHICLE_COLLECTION, true);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it("should not update anything (no collection supplied)", async () => {
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
    it("should update a document (in its collection)", async () => {
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
    it("should find all saved documents (in one collection)", async () => {
      let response;
      try {
        response = await db.find({}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it("should update all saved documents (in one collection)", async () => {
      let response;
      try {
        response = await db.updateMany({}, {$set: {engine: 3}}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it("should delete a single document by id", async () => {
      let response;
      try {
        response = await db.remove({_id: testCar._id.toString()}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      expect(response).to.equal(1);
    });
    it("should not delete a non-existent document", async () => {
      let response;
      try {
        response = await db.remove({_id: testCar._id.toString()}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      expect(response).to.equal(0);
    });
    it("should delete multiple documents in one collection", async () => {
      let response;
      try {
        response = await db.remove({}, VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
      expect(response).to.equal(2);
    });
    it("should throw an error when trying to delete from non-existent collection", async () => {
      let response;
      try {
        response = await db.remove({});
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    it("should be able to drop a collection", async () => {
      let response;
      try {
        response = await db.dropCollection(VEHICLE_COLLECTION);
      } catch (error) {
        should.not.exist(error);
      }
      should.exist(response);
    });
    it("should receive error when attempting to drop non-existent collection", async () => {
      let response;
      try {
        response = await db.dropCollection(ENGINE_COLLECTION);
      } catch (error) {
        should.exist(error);
      }
      should.not.exist(response);
    });
    after(async () => {
      try {
        await db.database.dropDatabase();
      } catch (error) {
        should.not.exist(error);
      }
    });
  }); // category end
}); // test end
