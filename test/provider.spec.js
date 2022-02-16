const { Verifier } = require("@pact-foundation/pact")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const { server, importData, comicRepository } = require("../provider.js")
const path = require("path")

server.listen(8084, () => {
  importData()
  console.log("Comics Service listening on http://localhost:8084")
})

// Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
  it("validates the expectations of Comics Service", () => {
    let token = "INVALID TOKEN"

    let opts = {
      provider: "e2e Provider Example",
      logLevel: "INFO",
      providerBaseUrl: "http://localhost:8084",

      requestFilter: (req, res, next) => {
        console.log(
          "Middleware invoked before provider API - injecting Authorization token"
        )
        req.headers["MY_SPECIAL_HEADER"] = "my special value"

        // e.g. ADD Bearer token
        req.headers["authorization"] = 'Bearer ' + token
        next()
      },

      stateHandlers: {
        "Has no comics": () => {
          comicRepository.clear()
          token = "1234"
          return Promise.resolve('Comics removed to the db')
        },
        "Has some comics": () => {
          token = "1234"
          importData()
          return Promise.resolve('Comics added to the db')
        },
        "Has an comic with ID 1": () => {
          token = "1234"
          importData()
          return Promise.resolve('Comic added to the db')
        },
        "is not authenticated": () => {
          token = ""
          Promise.resolve('Invalid bearer token generated')
        },
      },

      // Fetch pacts from broker
      pactBrokerUrl: "http://localhost:8000",

      // Fetch from broker with given tags
      consumerVersionTags: ["master", "test", "prod"],

      // Enables "pending pacts" feature
      enablePending: true,
      pactBrokerUsername: "pact_workshop",
      pactBrokerPassword: "pact_workshop",
      publishVerificationResult: true,
      providerVersion: "1.0.0",
    }

    return new Verifier(opts).verifyProvider().then(output => {
      console.log("Pact Verification Complete!")
      console.log(output)
    })
  })
})
