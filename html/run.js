const express = require('express')
const app = express()
const path = require('path')
const network = require('os').networkInterfaces()
const open = require('open')

app.use(express.static(path.resolve(__dirname, '../html/')))
app.use(express.static(path.resolve(__dirname, '../build/')))
app.use(express.static(path.resolve(__dirname, '../lib/')))

const getLocalIp = () => {
  if (!(network && Object.keys(network)) > 0) throw new Error('Invalid networkInterfaces.')
  for (let netName in network) {
    for (let i = 0; i < network[netName].length; i++) {
      let item = network[netName][i]
      if (item && item.family === 'IPv4' && !item.internal && item.address) {
        return item.address
      }
    }
  }
  return 'localhost'
}

const openBrowser = (targetURL) => {
  open(targetURL)
    .catch(err => {
      console.log('Failed to open your browser by node.')
      throw err
    })
}

let localIp = getLocalIp()
let port = 9099

const server = app.listen(port, localIp, () => {
  console.log('访问地址为 http://%s:%s', server.address().address, server.address().port)
  setTimeout(() => { openBrowser(`http://${localIp}:${port}`) }, 0)
})
