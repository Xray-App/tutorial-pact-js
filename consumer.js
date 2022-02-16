const express = require("express")
const request = require("superagent")
const server = express()

const getApiEndpoint = () => process.env.API_HOST || "http://localhost:8081"
const authHeader = {
  Authorization: "Bearer 1234",
}

// Fetch all comics
// Comics Service
const availableComics = () => {
  return request
    .get(`${getApiEndpoint()}/comics/available`)
    .set(authHeader)
    .then(res => res.body)
}

// Find comics by their ID
const getComicsById = id => {
  return request
    .get(`${getApiEndpoint()}/comics/${id}`)
    .set(authHeader)
    .then(
      res => res.body,
      () => null
    )
}

module.exports = {
  server,
  availableComics,
  getComicsById,
}
