const path = require("path")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const expect = chai.expect
const { Pact, Matchers } = require("@pact-foundation/pact")
const { log } = require("console")
const LOG_LEVEL = process.env.LOG_LEVEL || "WARN"

chai.use(chaiAsPromised)

describe("Pact", () => {
  const provider = new Pact({
    consumer: "e2e Consumer Example",
    provider: "e2e Provider Example",
    log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: LOG_LEVEL,
    spec: 2,
  })

  // Alias flexible matchers for simplicity
  const { eachLike, like, term, iso8601DateTimeWithMillis } = Matchers

  // comic to match
  const comic_to_match =  {
    id: 2,
    title: "Batman: no return",
    pages: 22
  }
 
  const MIN_COMICS = 2

  const comicBodyExpectation = {
    id: like(1),
    title: like("X-MEN"),
    pages: like(50)
  }

  // Define comics list payload, reusing existing object matcher
  const comicListExpectation = eachLike(comicBodyExpectation, {
    min: MIN_COMICS,
  })

  // Setup a Mock Server before unit tests run.
  // This server acts as a Test Double for the real Provider API.
  // We then call addInteraction() for each test to configure the Mock Service
  // to act like the Provider
  // It also sets up expectations for what requests are to come, and will fail
  // if the calls are not seen.
  before(() =>
    provider.setup().then(opts => {
      // Get a dynamic port from the runtime
      process.env.API_HOST = `http://localhost:${opts.port}`
    })
  )

  // After each individual test (one or more interactions)
  // we validate that the correct request came through.
  // This ensures what we _expect_ from the provider, is actually
  // what we've asked for (and is what gets captured in the contract)
  afterEach(() => provider.verify())

  // Configure and import consumer API
  // Note that we update the API endpoint to point at the Mock Service
  const {
    availableComics,
    getComicsById,
  } = require("../consumer")

  // Verify service client works as expected.
  //
  // Note that we don't call the consumer API endpoints directly, but
  // use unit-style tests that test the collaborating function behaviour -
  // we want to test the function that is calling the external service.
  describe("when a call to list all comics from the Comic Service is made", () => {
    describe("and the user is not authenticated", () => {
      before(() =>
        provider.addInteraction({
          state: "is not authenticated",
          uponReceiving: "a request for all comics",
          withRequest: {
            method: "GET",
            path: "/comics/available",
          },
          willRespondWith: {
            status: 401,
          },
        })
      )

      it("returns a 401 unauthorized", () => {
        return expect(availableComics(comic_to_match)).to.eventually.be.rejectedWith(
          "Unauthorized"
        )
      })
    })
    describe("and the user is authenticated", () => {
      describe("and there are comics in the database", () => {
        before(() =>
          provider.addInteraction({
            state: "Has some comics",
            uponReceiving: "a request for all comics",
            withRequest: {
              method: "GET",
              path: "/comics/available",
              headers: { Authorization: "Bearer 1234" },
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
              body: comicListExpectation,
            },
          })
        )

        it("returns a list of comics", done => {
          const comicsReturned = availableComics()

          expect(comicsReturned)
            .notify(done)
        })
      })
    })
  })

  describe("when a call to the Comic Service is made to retrieve a single comic by ID", () => {
    describe("and there is a comic in the DB with ID 1", () => {
      before(() =>
        provider.addInteraction({
          state: "Has an comic with ID 1",
          uponReceiving: "a request for an comic with ID 1",
          withRequest: {
            method: "GET",
            path: term({ generate: "/comics/1", matcher: "/comics/[0-9]+" }),
            headers: { Authorization: "Bearer 1234" },
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: comicBodyExpectation,
          },
        })
      )

      it("returns the animal", done => {
        const comicsRetuned = getComicsById(11)

        expect(comicsRetuned)
          .to.eventually.have.deep.property("id", 1)
          .notify(done)
      })
    })

    describe("and there no comics in the database", () => {
      before(() =>
        provider.addInteraction({
          state: "Has no comics",
          uponReceiving: "a request for an comic with ID 100",
          withRequest: {
            method: "GET",
            path: "/comics/100",
            headers: { Authorization: "Bearer 1234" },
          },
          willRespondWith: {
            status: 404,
          },
        })
      )

      it("returns a 404", done => {
        const comicReturned = getComicsById(100)

        expect(comicReturned)
          .to.eventually.be.a("null")
          .notify(done)
      })
    })
  })

  // Write pact files
  after(() => {
    return provider.finalize()
  })
})
