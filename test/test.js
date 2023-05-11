const chai = require("chai");
const chaiHttp = require("chai-http");
const nock = require("nock");

const app = require("../app");

chai.use(chaiHttp);
chai.should();

describe("Demo Vehcles API", () => {
  describe("GET /dealers", () => {
    it("should get a list of dealers", (done) => {
      chai
        .request(app)
        .get("/dealers")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        })
        .timeout(5000);
    });
    it("should get a list of dealers from the cache when 500 error occured", (done) => {
      nock("https://bb61co4l22.execute-api.us-west-2.amazonaws.com")
        .get("/development/dealers")
        .once()
        .reply(500, "Internal ServerError. Please try again");
      chai
        .request(app)
        .get("/dealers")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        })
        .timeout(5000);
    });
  });

  describe("GET /vehicles/:bac", () => {
    it("should get vehicles for a dealer", (done) => {
        nock("https://bb61co4l22.execute-api.us-west-2.amazonaws.com")
        .get("/vehicles/122345")
        .once()
        .reply(200, "Ok");
      chai
        .request(app)
        .get("/vehicles/122345")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        })
        .timeout(5000);
    });

    it("should get empty data for a non existance dealer", (done) => {
      //Doing this because api level there is a chance this can be 500.
      chai
        .request(app)
        .get("/vehicles/999999")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.should.have.lengthOf(0);
          done();
        })
        .timeout(5000);
    });

    it("should get a list of vehicles for a dealer from the cache when 500 error occured", (done) => {
      nock("https://bb61co4l22.execute-api.us-west-2.amazonaws.com")
        .get("/vehicles/122345")
        .once()
        .reply(500, "Internal ServerError. Please try again");
      chai
        .request(app)
        .get("/vehicles/122345")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        })
        .timeout(5000);
      nock.cleanAll();
    });
  });
});
