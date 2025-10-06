import { connectWebSocket, sendToWebSocket } from "./websocket.js";

const list = ['+a', '+b', '+c', '+d', '+e', '+f', '-a', '-b', '-c', '-d', '-e', '-f']
let index = 0

async function websocketTest() {
    console.log("starting test!")
    //just connect to the endpoint
    await connectWebSocket("localhost:8081/ws")


    setInterval(function (){
        index++
        console.log("sending -> ", list[index%list.length])
        sendToWebSocket(list[index%list.length])
        if (Math.random() < 0.1){
            sendToWebSocket("purge me!")
            console.log("purging!")
        }
    }, 1000)
}

websocketTest()
