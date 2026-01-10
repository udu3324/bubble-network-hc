import { writable } from "svelte/store"
import { foobar1, foobar3 } from "./supabaseClient"

export let isBot = false
export function setIsBot(bool) {
    isBot = bool
}
export let stopProcessing = false
export function setStopProcessing(bool) {
    stopProcessing = bool
}

export let centerX = 0
export let centerY = 0

export function setCenters(x, y) { 
    centerX = x
    centerY = y
}

export let mouseDown = false
export function setMouseDown(i) {
    mouseDown = i
}

export let kingCircle = []

export let kingMode = false
export function setKingMode(i) {
    kingMode = i
    kingModeW.set(i)
}

export let resetMode = false
export function setResetMode(i) {
    resetMode = i
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

export let mouseX = 0
export function setMouseX(i) {
    mouseX = i
}
export let mouseY = 0
export function setMouseY(i) {
    mouseY = i
}

export let nodes = [] // one node for every user
export let masterData = [] // {slackid, username, profile} username = display name
export let masterArray = []

export let slackIds = []
export let slackConnections = []

export let king = null
export function setKing(i) {
    king = i
}

export let kingShells = [] // shells to hold the nodes
let kingStrengths = []

// shell constants
const _shellInitCount = 3
const _shellInitRadius = 200

let cameraX = 0
let cameraY = 0

export let cameraZoom = 0.05 // higher = zoomed in

let maxPos = 4000

let nodeSmoothMovement = 10
let cameraZoomSpeed = 30
let cameraZoomSpeed2 = 10

export let zoomToKing = false // when new focus put camera there
export function setZoomToKing(bool) {
    zoomToKing = bool
    zoomedToKing.set(zoomToKing)
}
export let kingModeW = writable(false)
export let zoomedToKing = writable(false)

//let ticker = 0 (future use in case)
export let mouseTimer = 0
export let ds = 0 // velocity of scroll
export function setDS(x) {
    ds = x
}
let df = 0.8 // friction for smoothness

// other stuff rowan did while drunk
export let panOriginX = null
export function setPanOriginX(x) {
    panOriginX = x
}
export let panOriginY = null
export function setPanOriginY(y) {
    panOriginY = y
}
let panX = 0
export function setPanX(x) {
    panX = x
}
let panY = 0
export function setPanY(y) {
    panY = y
}

let prevCamX = null
let prevCamY = null

// for smoothness
let targetX = 0
let targetY = 0
let cameraEase = 10

let prevKing = null

let mouseClickedNode = false
export function setMouseClickedNode(bool) {
    mouseClickedNode = bool
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

let mapLoaded = false

let slackConnectionStrengths = [] // randomly generated

function circ(x, y, r, c) {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(posX(x), posY(y), r * cameraZoom, 0, 2 * Math.PI)
    ctx.fill()
    //alert(c)
}

function posX(x) {
    return (x - cameraX) * cameraZoom + centerX
}
function posY(y) {
    return (y - cameraY) * cameraZoom + centerY
}

export function reset() {
    king = null
    setKingMode(false)
    zoomToKing = false
    zoomedToKing.set(zoomToKing)
    setResetMode(true)
}

export function recenter() {
    targetX = 0
    targetY = 0
}

export let originalIds = []

function doItBetter() {
    // reset data

    slackIds = []
    slackConnections = []
    nodes = []
    kingCircle = []
    originalIds = []

    reset()

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


export async function gen() {
    if (isBot) {
        df = 1
        cameraEase = 1
        nodeSmoothMovement = 1
        cameraZoomSpeed = 1
        cameraZoomSpeed2 = 1
    }
    console.log("generating visualizer")

    // IF ON WEBSITE MODE, TAKE DATA FROM THE SERVER
    masterArray = await foobar1()
    //alert(masterArray)
    masterData = await foobar3()
    //alert(masterData.length)

    //compileData();
    //doEverythingICant();
    doItBetter()
    //return;
    // DERIVE IDS, CONNECTIONS FROM MASTER
    maxPos = 2000 + slackIds.length * 8

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

    mapLoaded = true
    //setKing(slackIds.indexOf("U07QLM85S7J")); // person who put in their thingy
}

export function tick(delta) {
    //ticker += delta
    //console.log(stopProcessing)
    if (stopProcessing) {
        //console.log("bot")
        return
    }

    if (!mapLoaded) {
        return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgb(2, 31, 46)"
    ctx.fillStyle = "##0f172b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!isBot) {
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, 40, 0, 2 * Math.PI)
        ctx.stroke()
    }

    cameraZoom += ds
    ds *= df

    if (cameraZoom < 0.01) {
        // max zoom out
        cameraZoom = 0.01
        ds = 0
    }
    if (cameraZoom > 10) {
        // max zoom in
        cameraZoom = 10
        ds = 0
    }

    if (mouseDown) {
        mouseTimer += delta
        //alert("yo")
    } else {
        mouseTimer = 0
    }
    //console.log(mouseTimer)

    if (panOriginX != null) {
        setZoomToKing(false)
        if (prevCamX == null) {
            prevCamX = cameraX
            prevCamY = cameraY
        }
        //cameraX = prevCamX - (panX - panOriginX)/cameraZoom
        //cameraY = prevCamY - (panY - panOriginY)/cameraZoom
        targetX = prevCamX - (panX - panOriginX) / cameraZoom
        targetY = prevCamY - (panY - panOriginY) / cameraZoom
        let dx = targetX - cameraX
        let dy = targetY - cameraY

        cameraX += dx / cameraEase
        cameraY += dy / cameraEase
    } else {
        if (prevCamX != null) {
            prevCamX = null
        }

        let dx = targetX - cameraX
        let dy = targetY - cameraY

        cameraX += dx / cameraEase
        cameraY += dy / cameraEase
        prevCamX = cameraX
        prevCamY = cameraY
    }

    if (zoomToKing) {
        setResetMode(false)
        cameraZoom += (0.2 - cameraZoom) / cameraZoomSpeed
        let tX = nodes[king].pos.x
        let tY = nodes[king].pos.y

        cameraX += (tX - cameraX) / cameraZoomSpeed2
        cameraY += (tY - cameraY) / cameraZoomSpeed2
        targetX = cameraX
        targetY = cameraY
    }

    if (resetMode) {
        cameraZoom += (0.05 - cameraZoom) / 30

        targetX = cameraX
        targetY = cameraY
    }

    //document.getElementById("d").innerHTML = panX + "," + panY

    // if there is a king node, create the king circle, instant update after change
    if (king != prevKing) {
        prevKing = king
        if (king != null) {
            setKingMode(true)

            setZoomToKing(true)
            assembleKing()
        }
    }

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
    //alert(kingShells.length)
}

function surroundNodes() {
    for (let i = 0; i < kingCircle.length; i++) {
        nodes[kingCircle[i]].approachShell()
    }
}

function displayNodes() {
    //alert("h")
    let guyTouched = null
    taken = null
    let circle = null
    if (king != null) {
        taken = king
    }
    for (let i = 0; i < nodes.length; i++) {
        if (mouseClickedNode || document.body.style.cursor !== "grab") {
            nodes[i].touch(mouseClickedNode)
        }

        if (nodes[i].circleTouched) {
            circle = i
        }
        if (nodes[i].touched) {
            guyTouched = i
        }
    }
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].renderConnections()
    }
    for (let i = 0; i < nodes.length; i++) {
        let temp = nodes[i]
        temp.display()
    }

    // do not draw info box while panning, smooth mode causes flashing
    if (document.body.style.cursor === "grab") {
        return
    }

    if (circle != null) {
        nodes[circle].drawInfoBox()
    }
    if (guyTouched != null) {
        nodes[guyTouched].drawInfoBox()
    }

    if (mouseClickedNode) {
        mouseClickedNode = false
    }
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
                if (Math.sqrt(Math.pow(temp.pos.x - this.pos.x, 2) + Math.pow(temp.pos.y - this.pos.y, 2)) <= (this.rad + temp.rad) * 2) {
                    breaker = false
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
        if (!this.touched && taken != null) {
            this.lineFade += (0 - this.lineFade) / 5
        } else if (!this.touched) {
            this.lineFade += (this.lineNatural - this.lineFade) / 16
        } else {
            this.lineFade += (.7 - this.lineFade) / 4
        }
        if (king == this.id) {
            this.lineFade = .2
        }
        // commented if statements check if connection is out of bounds
        //if (posX(this.pos.x) >= 0 - this.rad * cameraZoom && posX(this.pos.x) <= canvas.width * 1.25 + this.rad * cameraZoom) {
        //  if (posY(this.pos.y) >= 0 - this.rad * cameraZoom && posY(this.pos.y) <= canvas.height * 1.25 + this.rad * cameraZoom) {
        if (this.inRange()) {
            ctx.globalAlpha = this.lineFade
            if (this.lineFade > 0.01) {
                if (this.inZoom() || king == this.id) { // zooming out prioritizes people with larger connections
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
    }
    display() {
        // move towards / away the king
        if (king != null && king != this.id) {
            let target = nodes[king]
            let targetX = target.pos.x
            let targetY = target.pos.y
            let dir = Math.atan((this.pos.x - targetX) / (this.pos.y - targetY))
            dir = Math.atan2((this.pos.y - targetY), (this.pos.x - targetX))
            let dist = Math.sqrt(Math.pow((this.pos.y - targetY), 2) + Math.pow((this.pos.x - targetX), 2))
            if (this.connectionIds.includes(king)) { // move to
                this.showName()
            } else { // move away
                if (isBot) {
                    return
                }
                this.pos.x += Math.cos(dir) * 10000 / dist * (1 + kingCircle.length / 10)
                this.pos.y += Math.sin(dir) * 10000 / dist * (1 + kingCircle.length / 10)
            }
        } else if (king == this.id) {
            this.showName()
        } else { // no king selected, return to init pos
            this.pos.x += (this.startX - this.pos.x) / nodeSmoothMovement
            this.pos.y += (this.startY - this.pos.y) / nodeSmoothMovement
        }
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
        if (this.touched) {
            this.showName()
        }
        ctx.globalAlpha = this.fade
        // draw outline
        circ(this.pos.x, this.pos.y, this.rad * 1.1, "white")
        // draw circle
        circ(this.pos.x, this.pos.y, this.rad, this.color)
        ctx.globalAlpha = 1

    }
    inRange() {
        if (king == this.id) {
            return true
        }
        if (posX(this.pos.x) <= canvas.width + this.rad * cameraZoom * 4 && posX(this.pos.x) >= 0 - this.rad * cameraZoom * 4) {
            if (posY(this.pos.y) <= canvas.height + this.rad * cameraZoom * 4 && posY(this.pos.y) >= 0 - this.rad * cameraZoom * 4) {
                return true
            }
        }
        return false
    }
    inZoom() { // zooming out prioritizes nodes w/ larger connections
        let visibility = 0
        return Math.pow(this.connectionLines.length, 2) > Math.pow(visibility, 2) / cameraZoom
    }
    showName() {

        // dont show usernames in main view when panning, smooth panning causes flashing of usernames
        if ((document.body.style.cursor === "grab") && !kingMode) {
            return
        }

        // Show username
        let size = this.displayName.length
        let fontSize = 60 / (1 + Math.min(Math.pow(this.displayName.length / 10, 2) / 20, 3))
        ctx.font = cameraZoom * fontSize + "px monospace"
        ctx.fillStyle = "white"
        ctx.fillText(this.displayName, posX(this.pos.x - size * fontSize / 3), posY(this.pos.y + this.rad * 2))
    }
    touch(mouseClickedNode) {
        let xp = posX(this.pos.x)
        let yp = posY(this.pos.y)
        this.touched = false
        if (taken == null) { // nobody touched yet
            let dist = Math.sqrt(Math.pow((xp - mouseX), 2) + Math.pow((yp - mouseY), 2))
            if (dist <= this.rad * cameraZoom) {
                taken = this.id
                this.touched = true
            }
        }
        if (king == null && this.touched && mouseDown || (this.touched && mouseClickedNode)) {
            king = this.id
        }
        this.circleTouched = false
        // when in king mode hovering and stuff you know the drill
        if (king == this.id || (king != null && nodes[king].connectionIds.includes(this.id))) {
            let dist = Math.sqrt(Math.pow((xp - mouseX), 2) + Math.pow((yp - mouseY), 2))
            if (dist <= this.rad * cameraZoom) {
                this.circleTouched = true
                //alert("wow")
            }
        }
    }
    assignShell(shell) {
        this.shell = shell
    }
    approachShell() {
        let angle = this.shell.angles[this.shell.children.indexOf(this)]
        let radius = this.shell.radius
        let centerX = nodes[king].pos.x
        let centerY = nodes[king].pos.y
        let targetX = Math.cos(angle) * radius + centerX
        let targetY = Math.sin(angle) * radius + centerY
        let speed = isBot ? 1 : (14 + this.shell.children.length / 3)
        this.pos.x += (targetX - this.pos.x) / speed
        this.pos.y += (targetY - this.pos.y) / speed
    }
    drawInfoBox() {
        if (this.failed) {
            ctx.fillStyle = "white"
            ctx.font = "8px monospace"
            ctx.fillStyle = "rgb(10,16,26)"
            ctx.globalAlpha = 0.5
            ctx.rect(mouseX + offset, mouseY - 100 - offset, nameplateWidth, 100)
            ctx.fill()
            ctx.globalAlpha = 1.0
            ctx.fillText(this.displayName, mouseX + offset + 10, mouseY - offset - 45)
            return
        }
        // image handling
        if (this.img == null) { // need to load the image
            this.img = new Image()
            //this.img.crossOrigin = "anonymous" // REMOVE REMOVE REMOVE REMOVE
            //workaround for cors issue
            this.img.src = `/api/slack/avatar?url=${masterData[this.id].profile_picture}`
            this.img.onload = () => {
                this.imgReady = true
            }
        }
        // draw box thingy ma boo
        ctx.font = "25px Courier New"
        let width = ctx.measureText("M").width
        let nameWidth = width * this.displayName.length
        //console.log(nameWidth)
        nameWidth -= 90
        if (nameWidth < 0) {
            nameWidth = 0
        }
        let nameplateWidth = 200 + nameWidth * 1.25
        let offset = 5
        // loading text
        ctx.fillStyle = "white"
        ctx.font = "8px monospace"
        ctx.fillStyle = "rgb(10,16,26)"
        ctx.globalAlpha = 0.5
        ctx.rect(mouseX + offset, mouseY - 100 - offset, nameplateWidth, 100)
        ctx.fill()
        ctx.globalAlpha = 1.0
        if (this.imgReady) { // draw image
            ctx.drawImage(this.img, mouseX + 5 + offset, mouseY - offset - 95, 90, 90)
        }
        ctx.fillStyle = "white"
        // show name
        ctx.font = "25px Courier New"
        ctx.fillText(this.displayName, mouseX + offset + 105, mouseY - offset - 45)
        // show # of connections
        ctx.font = "12px Courier New"
        ctx.fillText("@'s: " + this.connectionIds.length, mouseX + offset + 105, mouseY - offset - 20)
        // show slack id
        ctx.font = "7px monospace"
        ctx.globalAlpha = 0.8
        ctx.fillText("ID: " + this.user, mouseX + offset + 102, mouseY - offset - 10)
        ctx.globalAlpha = 1
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
            ctx.lineWidth = this.strength * cameraZoom * 1.2
            ctx.moveTo(posX(this.user1.pos.x), posY(this.user1.pos.y))
            ctx.lineTo(posX(this.user2.pos.x), posY(this.user2.pos.y))
            ctx.stroke()
        }
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.lineWidth = this.strength * cameraZoom
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
        ctx.lineWidth = cameraZoom * 2
        ctx.beginPath()
        ctx.arc(posX(this.x), posY(this.y), this.radius * cameraZoom, 0, 2 * Math.PI)
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