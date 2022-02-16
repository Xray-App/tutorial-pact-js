const { server, importData } = require("./provider.js")
importData()

server.listen(8084, () => {
  console.log("Comics Profile Service listening on http://localhost:8084")
})
