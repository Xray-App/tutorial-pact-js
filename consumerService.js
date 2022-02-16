const { server } = require("./consumer.js")

server.listen(8080, () => {
  console.log("Comics Service listening on http://localhots:8080")
})
