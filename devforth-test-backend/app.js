const WebSocket = require('isomorphic-ws');
const http = require('http');

const server = new WebSocket.Server({port: 9000});

let timer = 5;
let balance = 100;
let multiplier = 0;
let expectedWin = 0;

const casino = (socket) => {
    const casino_timer = () => {
        timer--;
        socket.send((JSON.stringify(
            {
                message: 'round_countdown',
                countdown: timer,
            }
        )))
        if (timer >= 1) {
            setTimeout(casino_timer, 1000)
        } else {
            setTimeout(casino_multiplier, 500)
        }
    }
    setTimeout(casino_timer, 1000)

    const casino_multiplier = async () => {
        multiplier = multiplier + 0.01;
        socket.send((JSON.stringify(
            {
                message: 'multiplier_update',
                multiplier: multiplier.toFixed(2),
            }
        )))
        if (multiplier < (Math.random()*600).toFixed(2)) {
            setTimeout(casino_multiplier, 40)
        } else {
            timer = 6;
            multiplier = 0;
            socket.send(JSON.stringify({
                message: 'crash',
            }))
            casino(socket);
        }
    }
}


server.on("connection", socket => {
    const message = {
        message: 'new_balance',
        balance: balance.toFixed()
    }
    socket.send(JSON.stringify(message))
    casino(socket);

    // sending message
    socket.on("message", data => {
        const request = JSON.parse(data);

        switch (request.message) {
            case 'make_bet':
                balance = balance - +request.value;
                expectedWin = request.value

                socket.send(JSON.stringify({
                    message: 'new_balance',
                    balance: balance.toFixed()
                }))
                break;

            case 'take':
                balance = balance + +(expectedWin * +request.multiplier);
                socket.send(JSON.stringify({
                    message: 'new_balance',
                    balance: balance.toFixed()
                }))
                break;
        }
    });


    // handling what to do when clients disconnects from server
    server.on("close", () => {
        console.log("the client has disconnected");

    });

    // handling client connection error
    server.onerror = function (err) {
        console.log("Some Error occurred", err)
    }
});
