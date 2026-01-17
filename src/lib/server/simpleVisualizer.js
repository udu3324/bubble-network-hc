export let visibility = 100

export let centerX = 0
export let centerY = 0

export function setCenters(x, y) { 
    centerX = x
    centerY = y
}

export let kingCircle = []

export let kingMode = false
export function setKingMode(i) {
    kingMode = i
}

export let canvas
export let ctx

export function setCanvas(canv, width, height) {
    canvas = canv
    ctx = canvas.getContext('2d')

    centerX = width / 2
    centerY = height / 2

    //console.log(centerX)
}

// for hovering
let taken = null // will be set to id of node getting touched innapropriately

export let nodes = [] // one node for every user
export let masterData = [] // {slackid, username, profile} username = display name
export let masterArray = []

export let slackIds = []
export let slackConnections = []

export let king = null
export function setKing(i) {
    if (king !== i) {
        king = i
        kingMode = true
        zoomToKing = true
        assembleKing()
    }
}

export let kingShells = [] // shells to hold the nodes
let kingStrengths = []

// shell constants
const _shellInitCount = 3
const _shellInitRadius = 200

export let camera = {
    x: 0,
    y: 0,
    zoom: 0.05
}

let maxPos = 4000

export let zoomToKing = false // when new focus put camera there
export function setZoomToKing(bool) {
    zoomToKing = bool
}

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i)
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0]
}

function randomColor(seed) {
    // convert seed to color
    // substring from (2-length)
    // ex: U0 [8RUQLU128]
    
    seed = seed.substring(2)
    let newSeed = cyrb128(seed)
    
    return "rgb(" + newSeed[0] % 255 + "," + newSeed[1] % 255 + "," + newSeed[2] % 255 + ")"
}

let slackConnectionStrengths = [] // randomly generated

function circ(x, y, r, c) {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(posX(x), posY(y), r * camera.zoom, 0, 2 * Math.PI)
    ctx.fill()
    //alert(c)
}

function posX(x) {
    return (x - camera.x) * camera.zoom + centerX
}
function posY(y) {
    return (y - camera.y) * camera.zoom + centerY
}

export let originalIds = []

function doItBetter() {

    slackIds = []
    slackConnections = []
    nodes = []
    kingCircle = []
    originalIds = []
    
    // iterate throught he data to createa a general list of slack ids to resort back to
    // then, get connections through the master array (slack ids will be aligned with the data)
    // finally, create the slackconnections array

    // step 1
    for (let i = 0; i < masterData.length; i++) {
        slackIds.push(masterData[i].slack_id)
        
        slackConnections.push([])
    }

    // step 2 + step 3?

    for (let i = 0; i < masterArray.length; i++) {
        // assuming not the entire map of slack, a few people, derive connections
        let masterNode = masterArray[i]
        let masterSlackId = masterNode.slack_id
        let masterConnections = masterNode.id_list
        originalIds.push(masterSlackId)

        for (let x = 0; x < masterConnections.length; x++) {
            // update connection for the other person
            let target = slackIds.indexOf(masterConnections[x])
            if (target > -1) {
                //console.log(slackConnections.length + " -> " + target);
                if (!slackConnections[target].includes(masterSlackId)) {
                    slackConnections[target].push(masterSlackId)
                }
            }

            // update connection for the master man
            slackConnections[slackIds.indexOf(masterSlackId)] =
                masterConnections
        }
    }

    //console.log(slackConnections);
}


export async function gen(mA, mD) {
    console.log("generating visualizer")

    // IF ON WEBSITE MODE, TAKE DATA FROM THE SERVER
    masterArray = mA
    masterData = mD
    
    //alert(masterData.length)

    //compileData();
    //doEverythingICant();
    doItBetter()
    //return;
    // DERIVE IDS, CONNECTIONS FROM MASTER
    maxPos = 2000 + slackIds.length * 10

    // Eleminate any ids in connections that don't exist
    for (let i = 0; i < slackConnections.length; i++) {
        let nodeConnections = slackConnections[i]
        for (let j = nodeConnections.length - 1; j >= 0; j--) {
            if (
                !slackIds.includes(nodeConnections[j]) ||
                nodeConnections[j] == slackIds[i]
            ) {
                nodeConnections.splice(j, 1)
            }
        }
        slackConnections[i] = nodeConnections

        // Create randomly generated strengths for each connection

        let randomStrengths = []
        for (let x = 0; x < nodeConnections.length; x++) {
            randomStrengths.push(Math.ceil(Math.random() * 100))
        }
        slackConnectionStrengths.push(randomStrengths)

        // constructor(slackId, connections, id, connectionStrength)
        nodes.push(
            new Node(
                slackIds[i],
                slackConnections[i],
                i,
                slackConnectionStrengths[i],
            ),
        )
    }

    // generate connections for each node (visual)
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].generateConnections()
    }

    //setKing(slackIds.indexOf("U07QLM85S7J")); // person who put in their thingy
}

export function render() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgb(2, 31, 46)"
    ctx.fillStyle = "##0f172b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //if (zoomToKing) {
    //    camera.x = nodes[king].pos.x
    //    camera.y = nodes[king].pos.y
    //}

    if (king != null) {
        // display shells and bring closer to king
        displayShells()
        surroundNodes()
    }

    // display the nodes

    displayNodes()
}

function displayShells() {
    for (let i = 0; i < kingShells.length; i++) {
        kingShells[i].display()
    }
}

function surroundNodes() {
    for (let i = 0; i < kingCircle.length; i++) {
        nodes[kingCircle[i]].placeOnShell()
    }
}

export let circleTouching = false
export let circleTouched = null

function displayNodes() {
    taken = null
    let circle = null
    if (king != null) {
        taken = king
    }
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].renderConnections()
    }
    for (let i = 0; i < nodes.length; i++) {
        let temp = nodes[i]
        temp.display()
    }

    circleTouching = circle != null
    circleTouched = circle
}

function assembleKing() {
    // king circle = connections to the king
    // KINGNODE -> NODE THAT ENTIRE PROGRAM REVOLVES AROUND
    let kingNode = nodes[king]
    kingCircle = kingNode.connectionIds
    kingStrengths = kingNode.connectionStrength

    // sort the powers array while keeping kingCircle array in same order

    for (let a = 0; a < kingStrengths.length; a++) {
        for (let i = 0; i < kingStrengths.length - a; i++) {
            if (kingStrengths[i] < kingStrengths[i + 1]) {
                let temp = kingStrengths[i]
                kingStrengths[i] = kingStrengths[i + 1]
                kingStrengths[i + 1] = temp

                temp = kingCircle[i]
                kingCircle[i] = kingCircle[i + 1]
                kingCircle[i + 1] = temp
            }
        }
    }
    // CREATE THE SHELLS

    // find needed # of shells
    kingShells = []
    let numShells = 0
    let slotsNeeded = kingCircle.length
    while (true) {
        numShells++
        slotsNeeded -= numShells * _shellInitCount
        if (slotsNeeded <= 0) {
            break
        }
    }

    // create shells + assign nodes

    let overallIndex = 0

    for (let i = 0; i < numShells; i++) {
        kingShells.push(
            new Shell(
                kingNode,
                i + 1,
                _shellInitRadius,
                _shellInitCount,
            ),
        )
        let currentShell = kingShells[i]
        let nodesToAdd = (i + 1) * _shellInitCount
        let x = 0
        for (x = 0; x < nodesToAdd; x++) {
            if (x + overallIndex >= kingCircle.length) {
                break // will also be end of overall for loop
            }
            let currentNode = nodes[kingCircle[x + overallIndex]]
            currentShell.children.push(currentNode)
            currentNode.assignShell(currentShell)
        }
        overallIndex += x

        currentShell.createAngles()
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Node { // id correlates to id in the list of peoples
    constructor(slackId, connections, id, connectionStrength) {
        this.user = slackId // SLACK ID
        this.id = id // ID IN THE ARRAY
        this.connections = connections // Array of slackIds that they know
        this.connectionStrength = connectionStrength
        this.connectionDisplay = [] // display only if your id is less
        this.connectionIds = []
        this.pos = new Vector2(0, 0) // position
        this.rad = 50
        while (true) { // find a random position for the node to be
            let dir = Math.random() * Math.PI * 2
            let r = Math.random() * maxPos
            let x = Math.cos(dir) * r
            let y = Math.sin(dir) * r
            this.pos.x = x
            this.pos.y = y
            let breaker = true
            for (let i = 0; i < nodes.length; i++) {
                let temp = nodes[i]
                if (Math.sqrt(Math.pow(temp.pos.x - this.pos.x, 2) + Math.pow(temp.pos.y - this.pos.y, 2)) <= (this.rad + temp.rad) * 2 + 1.25 * (this.connections.length + temp.connections.length) ) {
                    breaker = false
                    break
                }
            }
            if (breaker) { // NOT WORKING
                //alert(id)
                break
            }
        }
        this.startX = this.pos.x
        this.startY = this.pos.y
        this.color = randomColor(this.user) // random color
        this.touched = false
        this.circleTouched = false // is in kingcircle and is hovered over (king included)
        this.connectionLines = []
        this.fade = 1 // smoothnessss
        this.lineNatural = 0.15
        this.lineFade = this.lineNatural

        this.dataId = this.id
        //console.log(masterData[this.dataId].username);
        try {
            this.displayName = masterData[this.dataId].username
            if (this.displayName.length>20) {
                this.displayName = this.displayName.substring(0,20)
            }
        } catch (error) {
            console.error(error)

            this.displayName = this.user
            this.failed = true
        }
        this.img = null // only load it once
        this.imgReady = false
    }
    generateConnections() {
        for (let i = 0; i < this.connections.length; i++) {
            let partnerIndex = slackIds.indexOf(this.connections[i])
            this.connectionIds.push(partnerIndex)
            let connection = new Connection(this, nodes[partnerIndex], this.connectionStrength[i])
            this.connectionLines.push(connection)
            if (partnerIndex > this.id) {
                this.connectionDisplay.push(connection)
            }
        }
    }
    renderConnections() {
        if (king == this.id) {
            this.lineFade = 0.2
        } else if (!this.touched && taken != null) {
            this.lineFade = 0
        } else if (!this.touched) {
            this.lineFade = this.lineNatural
        } else {
            this.lineFade = 0.7
        }
        
        // commented if statements check if connection is out of bounds
        //if (posX(this.pos.x) >= 0 - this.rad * cameraZoom && posX(this.pos.x) <= canvas.width * 1.25 + this.rad * cameraZoom) {
        //  if (posY(this.pos.y) >= 0 - this.rad * cameraZoom && posY(this.pos.y) <= canvas.height * 1.25 + this.rad * cameraZoom) {
        ctx.globalAlpha = this.lineFade
        if (this.lineFade > 0.01) {
            if (this.inZoom() || king == this.id || this.touched) { // zooming out prioritizes people with larger connections
                if (king == this.id || (this.touched && king == null)) {
                    for (let i = 0; i < this.connectionLines.length; i++) { // show all connections yipee
                        this.connectionLines[i].display(this.color, (this.touched || king == this.id))
                    }
                } else {
                    for (let i = 0; i < this.connectionDisplay.length; i++) { // only show connections that you prioritize (the code does)
                        this.connectionDisplay[i].display(this.color, (this.touched || king == this.id))
                    }
                }
            }
        }
        ctx.globalAlpha = 1
    }
    display() {
        this.showName()
        //alert("h")
        if (!this.touched && taken != null && king != this.id) {
            if (this.connections.includes(slackIds[taken])) { // related to taken
                this.fade += (1 - this.fade) / 4
            } else {
                if (this.fade > 0.25) this.fade += (0.01 - this.fade) / 8
            }
        } else {
            this.fade += (1 - this.fade) / 4
        }
        ctx.globalAlpha = this.fade
        // draw outline
        circ(this.pos.x, this.pos.y, this.rad * 1.1, "white")
        // draw circle
        circ(this.pos.x, this.pos.y, this.rad, this.color)
        ctx.globalAlpha = 1

    }
    inZoom() { // zooming out prioritizes nodes w/ larger connections
        return Math.pow(this.connectionLines.length, 2) > Math.pow((visibility), 2) / camera.zoom
    }
    showName() {
        // Show username
        let size = this.displayName.length
        let fontSize = 60 / (1 + Math.min(Math.pow(this.displayName.length / 10, 2) / 20, 3))
        ctx.font = camera.zoom * fontSize + "px monospace"
        ctx.fillStyle = "white"
        ctx.fillText(this.displayName, posX(this.pos.x - size * fontSize / 3), posY(this.pos.y + this.rad * 2))
    }
    assignShell(shell) {
        this.shell = shell
    }
    placeOnShell() {
        let angle = this.shell.angles[this.shell.children.indexOf(this)]
        let radius = this.shell.radius
        let centerX = nodes[king].pos.x
        let centerY = nodes[king].pos.y

        this.pos.x = Math.cos(angle) * radius + centerX
        this.pos.y = Math.sin(angle) * radius + centerY
    }
}

class Connection { // MAKE A FEATURE TO WHEN IF NOT FOCUSED AND NOT KING THEN IF YOUR ID IS GREATER THAN ANOTHER DON'T RENDER YOUR CONNECTIONS BC OTHER ID WILL
    constructor(user1, user2) {
        this.user1 = user1
        this.user2 = user2
        this.strength = 8
    }
    display(color, doShadow) {
        //ctx.globalAlpha -= 0.1;
        if (doShadow) {
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.lineWidth = this.strength * camera.zoom * 1.2
            ctx.moveTo(posX(this.user1.pos.x), posY(this.user1.pos.y))
            ctx.lineTo(posX(this.user2.pos.x), posY(this.user2.pos.y))
            ctx.stroke()
        }
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.lineWidth = this.strength * camera.zoom
        ctx.moveTo(posX(this.user1.pos.x), posY(this.user1.pos.y))
        ctx.lineTo(posX(this.user2.pos.x), posY(this.user2.pos.y))
        //ctx.lineTo(0,0)
        ctx.stroke()
        //ctx.globalAlpha = 1
    }
}

class Shell { // centerNode = actual king node, shell# 1-max count, radius = rad increasess, initcount = how many on first shell
    constructor(centerNode, shellNumber, initRadius, initCount) {
        this.centerNode = centerNode
        this.shellNumber = shellNumber
        this.radius = initRadius * shellNumber
        this.count = initCount * shellNumber
        this.x = centerNode.pos.x
        this.y = centerNode.pos.y
        this.children = [] // nodes belonging (ids)
        this.angles = [] // node angles
    }
    display() {
        ctx.strokeStyle = "white"
        ctx.globalAlpha = 0.5
        ctx.lineWidth = camera.zoom * 2
        ctx.beginPath()
        ctx.arc(posX(this.x), posY(this.y), this.radius * camera.zoom, 0, 2 * Math.PI)
        ctx.stroke()
    }
    createAngles() { // after children are assigned
        let angle = Math.PI * 2 * Math.random()
        let d = Math.PI * 2 / this.children.length
        for (let i = 0; i < this.children.length; i++) {
            angle += d
            this.angles.push(angle)
        }
    }
}