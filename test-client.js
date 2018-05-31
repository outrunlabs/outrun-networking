const wrtc = require("electron-webrtc")()
const Peer = require("simple-peer")

const request = require("request-promise")

const start = async () => {
const ip = "35.185.247.212:8000"
// const ip = "localhost:8000"
const token = await request(`http://${ip}/connect`)

const invite = await request(`http://${ip}/redeem/${token}`)


const p = new Peer({ initiator: false, trickle: false, wrtc, channelConfig: {
        ordered: false,
        maxRetransmits: 0,
    } 
})

p.on("signal", (data) => {
    console.log("signal: " + JSON.stringify(data))
    const reply = request(`http://${ip}/answer/${token}`, {
        method: "POST",
        body: data,
        json: true,
    })
})

p.on("error", (err) => console.log("error: " + err))
p.on("data", (data) => console.log("data: " + data))
p.on("connect", () => {
    console.log("connect!")
    p.send("whatever" + Math.random())
    let i = 0

        setInterval(() => {
            i++
            p.send("msg: " + i.toString())
            
        }, 10)
})

p.signal(JSON.parse(invite))




console.dir(invite)
}

start()
