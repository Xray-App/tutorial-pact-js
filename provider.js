const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const Repository = require("./repository")

const server = express()
server.use(cors())
server.use(bodyParser.json())
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
server.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8")
  next()
})

server.use((req, res, next) => {
  const token = req.headers["authorization"] || ""

  if (token !== "Bearer 1234") {
    res.sendStatus(401).send()
  } else {
    next()
  }
})

const comicRepository = new Repository()

// Load default data into a repository
const importData = () => {
  const data = require("./data/comicsData.json")
  data.reduce((a, v) => {
    v.id = a + 1
    comicRepository.insert(v)
    return a + 1
  }, 0)
}

// Get all comics
server.get("/comics", (req, res) => {
  res.json(comicRepository.fetchAll())
})

// Get all available comics
server.get("/comics/available", (req, res) => {
  res.json(comicRepository.fetchAll())
})

// Find an comic by ID
server.get("/comics/:id", (req, res) => {
  const response = comicRepository.getById(req.params.id)
  if (response) {
    res.end(JSON.stringify(response))
  } else {
    res.writeHead(404)
    res.end()
  }
})

module.exports = {
  server,
  importData,
  comicRepository,
}
