const wrtc = require("electron-webrtc")()
const SimplePeer = require("simple-peer")

const bodyParser = require("body-parser")

const express = require("express")

const app = express()

app.use(bodyParser.json())

app.get("/", (req, res) => res.send("Hello world"))

let currentToken = 0
let tokenToOffer = {}
let tokenToPeer = {}

app.get("/connect", (req, res) => {

    currentToken++

    let localToken = currentToken



    const peer = new SimplePeer({
        initiator: true,
        wrtc: wrtc,
        trickle: false,
        channelConfig: {
            ordered: false,
            maxRetransmits: 0,
        }
    })

    tokenToPeer[localToken] = peer

    peer.on("connect", (data) => {
        console.log("peer::connect - " + data)

        peer.send("SOMERANDOMSTUFF: " + Math.random())
         let i = 0;

        setInterval(() => {
            i++
            peer.send("msg: " + i.toString())
            
        }, 10)
    })

    peer.on("data", (data) => {
        console.log("peer::data - " + data)
    })

    peer.on("signal", (data) => {
        console.log("----")
        tokenToOffer[localToken] = data
        console.log(data)

        setTimeout(() => {
            res.send(localToken.toString())
        }, 1000)
    })
})

app.get("/redeem/:id", (req, res) => {
    const id = req.params["id"]
    const data = tokenToOffer[id]

    if (data) {
        res.send(data)
    }
})

app.post("/answer/:id", (req, res) => {
   console.log(req.params.id) 
    console.log("BODY---")
    console.dir(req.body)
    console.log("--_BODY")

    tokenToPeer[req.params.id].signal(req.body)

    res.send()
})

wrtc.on("error", (err) => console.log(err))

console.log("starting...")

app.listen(8000, () => console.log("listening on 8000"))

