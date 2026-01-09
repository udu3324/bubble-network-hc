import { writable } from "svelte/store";
import { foobar1, foobar3 } from "./supabaseClient";

export let centerX = 0
export let centerY = 0
export function setCenters(x, y) {
    centerX = x
    centerY = y
}

export let mouseDown = false;
export function setMouseDown(i) {
    mouseDown = i;
}

export let kingCircle = [];
export function pushKingCircle(i) {
    kingCircle.push(i);
}
export function resetKingCircle(i) {
    kingCircle = [];
}
export function setKingCircle(i) {
    kingCircle = i;
}

export let kingMode = false;
export function setKingMode(i) {
    kingMode = i;
    kingModeW.set(i);
}

export let resetMode = false;
export function setResetMode(i) {
    resetMode = i;
}



export var canvas
export var ctx
export function setCanvas(canv, width, height) {
    canvas = canv
    ctx = canvas.getContext('2d')

    centerX = width / 2
    centerY = height / 2

    //console.log(centerX)
}

export let dataSlackIds = [];
export let dataIndexes = [];

// for hovering
export let taken = null; // will be set to id of node getting touched innapropriately
export function setTaken(x) {
    taken = x
}

export let mouseX = 0;
export function setMouseX(i) {
    mouseX = i
}
export let mouseY = 0;
export function setMouseY(i) {
    mouseY = i
}

export let nodes = []; // one node for every user
export let masterData = []; // {slackid, username, profile} username = display name
export function setMasterData(i) {
    masterData = i;
}
export let masterArray = [];
export function setMasterArray(i) {
    masterArray = i;
}

export let slackIds = [];
export let slackConnections = [];

export let king = null
export function setKing(i) {
    king = i
}

export let cameraX = 0
export function setCameraX(i) {
    cameraX = i
}
export let cameraY = 0
export function setCameraY(i) {
    cameraY = i
}

export let cameraZoom = 0.05 // higher = zoomed in
export function setCameraZoom(i) {
    cameraZoom = i
}

export let maxPos = 4000
export function setMaxPos(i) {
    maxPos = i;
}

export let zoomToKing = false; // when new focus put camera there
export function setZoomToKing(bool) {
    zoomToKing = bool
    zoomedToKing.set(zoomToKing)
}
export let kingModeW = writable(false)
export let zoomedToKing = writable(false)

function randomColor() {
    let total = 0;
    while (true) {
        let r = Math.random() * 255;
        let g = Math.random() * 255;
        let b = Math.random() * 255;
        total = r + g + b; // target >= 150-200
        if (total >= 150) {
            return "rgb(" + r + "," + g + "," + b + ")";
        }
    }


}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Node { // id correlates to id in the list of peoples
    constructor(slackId, connections, id, connectionStrength) {
        this.user = slackId; // SLACK ID
        this.id = id; // ID IN THE ARRAY
        this.connections = connections; // Array of slackIds that they know
        this.connectionStrength = connectionStrength;
        this.connectionDisplay = []; // display only if your id is less
        this.connectionIds = [];
        this.pos = new Vector2(0, 0); // position
        this.rad = 50;
        while (true) { // find a random position for the node to be
            let dir = Math.random() * Math.PI * 2;
            let r = Math.random() * maxPos;
            let x = Math.cos(dir) * r;
            let y = Math.sin(dir) * r;
            this.pos.x = x;
            this.pos.y = y;
            let breaker = true;
            for (let i = 0; i < nodes.length; i++) {
                let temp = nodes[i];
                if (Math.sqrt(Math.pow(temp.pos.x - this.pos.x, 2) + Math.pow(temp.pos.y - this.pos.y, 2)) <= (this.rad + temp.rad) * 2) {
                    breaker = false;
                }
            }
            if (breaker) { // NOT WORKING
                //alert(id)
                break;
            }
        }
        this.startX = this.pos.x;
        this.startY = this.pos.y;
        this.color = randomColor(); // random color
        this.touched = false;
        this.circleTouched = false; // is in kingcircle and is hovered over (king included)
        this.connectionLines = [];
        this.fade = 1; // smoothnessss
        this.lineNatural = 0.15;
        this.lineFade = this.lineNatural;

        this.dataId = this.id;
        //console.log(masterData[this.dataId].username);
        try {
            this.displayName = masterData[this.dataId].username;
        } catch (error) {
            this.displayName = this.user
            this.failed = true;
        }
        this.img = null; // only load it once
        this.imgReady = false;
    }
    generateConnections() {
        for (let i = 0; i < this.connections.length; i++) {
            let partnerIndex = slackIds.indexOf(this.connections[i])
            this.connectionIds.push(partnerIndex);
            let connection = new Connection(this, nodes[partnerIndex], this.connectionStrength[i]);
            this.connectionLines.push(connection);
            if (partnerIndex > this.id) {
                this.connectionDisplay.push(connection);
            }
        }
    }
    renderConnections() {
        let dx = 0;
        let dy = 0;
        if (!this.touched && taken != null) {
            this.lineFade += (0 - this.lineFade) / 5;
        } else if (!this.touched) {
            this.lineFade += (this.lineNatural - this.lineFade) / 16;
        } else {
            this.lineFade += (.7 - this.lineFade) / 4;
        }
        if (king == this.id) {
            this.lineFade = .2
        }
        // commented if statements check if connection is out of bounds
        //if (posX(this.pos.x) >= 0 - this.rad * cameraZoom && posX(this.pos.x) <= canvas.width * 1.25 + this.rad * cameraZoom) {
        //  if (posY(this.pos.y) >= 0 - this.rad * cameraZoom && posY(this.pos.y) <= canvas.height * 1.25 + this.rad * cameraZoom) {
        if (this.inRange()) {
            ctx.globalAlpha = this.lineFade;
            if (this.lineFade > 0.01) {
                if (this.inZoom() || king == this.id) { // zooming out prioritizes people with larger connections
                    if (king == this.id || (this.touched && king == null)) {
                        for (let i = 0; i < this.connectionLines.length; i++) { // show all connections yipee
                            this.connectionLines[i].display(this.color, (this.touched || king == this.id));
                        }
                    } else {
                        for (let i = 0; i < this.connectionDisplay.length; i++) { // only show connections that you prioritize (the code does)
                            this.connectionDisplay[i].display(this.color, (this.touched || king == this.id));
                        }
                    }
                }
            }
            ctx.globalAlpha = 1;
        }
    }
    display() {
        // move towards / away the king
        if (king != null && king != this.id) {
            let target = nodes[king];
            let targetX = target.pos.x;
            let targetY = target.pos.y;
            let dir = Math.atan((this.pos.x - targetX) / (this.pos.y - targetY));
            dir = Math.atan2((this.pos.y - targetY), (this.pos.x - targetX))
            let dist = Math.sqrt(Math.pow((this.pos.y - targetY), 2) + Math.pow((this.pos.x - targetX), 2));
            if (this.connectionIds.includes(king)) { // move to
                this.showName()
            } else { // move away
                this.pos.x += Math.cos(dir) * 10000 / dist * (1 + kingCircle.length / 10);
                this.pos.y += Math.sin(dir) * 10000 / dist * (1 + kingCircle.length / 10);
            }
        } else if (king == this.id) {
            this.showName()
        } else { // no king selected, return to init pos
            this.pos.x += (this.startX - this.pos.x) / 10;
            this.pos.y += (this.startY - this.pos.y) / 10;
        }
        //alert("h")
        if (!this.touched && taken != null && king != this.id) {
            if (this.connections.includes(slackIds[taken])) { // related to taken
                this.fade += (1 - this.fade) / 4
            } else {
                if (this.fade > 0.25) this.fade += (0.01 - this.fade) / 8;
            }
        } else {
            this.fade += (1 - this.fade) / 4;
        }
        if (this.touched) {
            this.showName()
        }
        ctx.globalAlpha = this.fade;
        // draw outline
        circ(this.pos.x, this.pos.y, this.rad * 1.1, "white")
        // draw circle
        circ(this.pos.x, this.pos.y, this.rad, this.color);
        ctx.globalAlpha = 1;
        // draw info box if im touched
        this.touch();
        if (this.circleTouched) {
            //this.drawInfoBox();
        }
    }
    inRange() {
        if (king == this.id) {
            return true;
        }
        if (posX(this.pos.x) <= canvas.width + this.rad * cameraZoom * 4 && posX(this.pos.x) >= 0 - this.rad * cameraZoom * 4) {
            if (posY(this.pos.y) <= canvas.height + this.rad * cameraZoom * 4 && posY(this.pos.y) >= 0 - this.rad * cameraZoom * 4) {
                return true;
            }
        }
        return false;
    }
    inZoom() { // zooming out prioritizes nodes w/ larger connections
        let visibility = 0;
        return Math.pow(this.connectionLines.length, 2) > Math.pow(visibility, 2) / cameraZoom
    }
    showName() {

        if (document.body.style.cursor === "grab") {
            return
        }
        // Show username
        let size = this.displayName.length;
        let fontSize = 60 / (1 + Math.min(Math.pow(this.displayName.length / 10, 2) / 20, 3));
        ctx.font = cameraZoom * fontSize + "px monospace";
        ctx.fillStyle = "white"
        ctx.fillText(this.displayName, posX(this.pos.x - size * fontSize / 3), posY(this.pos.y + this.rad * 2))
    }
    touch() {
        let xp = posX(this.pos.x);
        let yp = posY(this.pos.y);
        this.touched = false;
        if (taken == null) { // nobody touched yet
            let dist = Math.sqrt(Math.pow((xp - mouseX), 2) + Math.pow((yp - mouseY), 2))
            if (dist <= this.rad * cameraZoom) {
                taken = this.id;
                this.touched = true;
            }
        }
        if (king == null && this.touched && mouseDown) {
            king = this.id;
        }
        this.circleTouched = false;
        // when in king mode hovering and stuff you know the drill
        if (king == this.id || (king != null && nodes[king].connectionIds.includes(this.id))) {
            let dist = Math.sqrt(Math.pow((xp - mouseX), 2) + Math.pow((yp - mouseY), 2))
            if (dist <= this.rad * cameraZoom) {
                this.circleTouched = true;
                //alert("wow")
            }
        }
    }
    assignShell(shell) {
        this.shell = shell;
    }
    approachShell() {
        let angle = this.shell.angles[this.shell.children.indexOf(this)]
        let radius = this.shell.radius;
        let centerX = nodes[king].pos.x;
        let centerY = nodes[king].pos.y;
        let targetX = Math.cos(angle) * radius + centerX;
        let targetY = Math.sin(angle) * radius + centerY;
        let speed = (14 + this.shell.children.length / 3)
        this.pos.x += (targetX - this.pos.x) / speed;
        this.pos.y += (targetY - this.pos.y) / speed;
    }
    drawInfoBox() {
        if (this.failed) {
            ctx.fillStyle = "white"
            ctx.font = "8px monospace"
            ctx.fillStyle = "rgb(10,16,26)"
            ctx.globalAlpha = 0.5;
            ctx.rect(mouseX + offset, mouseY - 100 - offset, nameplateWidth, 100);
            ctx.fill()
            ctx.globalAlpha = 1.0;
            ctx.fillText(this.displayName, mouseX + offset + 10, mouseY - offset - 45)
            return;
        }
        // image handling
        if (this.img == null) { // need to load the image
            this.img = new Image();
            this.img.src = masterData[this.id].profile_picture;
            this.img.onload = () => {
                this.imgReady = true;
            }
        }
        // draw box thingy ma boo
        ctx.font = "25px Courier New"
        let width = ctx.measureText("M").width;
        let nameWidth = width * this.displayName.length;
        //console.log(nameWidth)
        nameWidth -= 90;
        if (nameWidth < 0) {
            nameWidth = 0;
        }
        let nameplateWidth = 200 + nameWidth * 1.25;
        let offset = 5;
        // loading text
        ctx.fillStyle = "white"
        ctx.font = "8px monospace"
        ctx.fillStyle = "rgb(10,16,26)"
        ctx.globalAlpha = 0.5;
        ctx.rect(mouseX + offset, mouseY - 100 - offset, nameplateWidth, 100);
        ctx.fill()
        ctx.globalAlpha = 1.0;
        if (this.imgReady) { // draw image
            ctx.drawImage(this.img, mouseX + 5 + offset, mouseY - offset - 95, 90, 90)
        }
        ctx.fillStyle = "white"
        // show name
        ctx.font = "25px Courier New"
        ctx.fillText(this.displayName, mouseX + offset + 105, mouseY - offset - 45)
        // show # of connections
        ctx.font = "12px Courier New";
        ctx.fillText("@'s: " + this.connectionIds.length, mouseX + offset + 105, mouseY - offset - 20);
        // show slack id
        ctx.font = "7px monospace"
        ctx.globalAlpha = 0.8;
        ctx.fillText("ID: " + this.user, mouseX + offset + 102, mouseY - offset - 10)
        ctx.globalAlpha = 1
    }
}

class Connection { // MAKE A FEATURE TO WHEN IF NOT FOCUSED AND NOT KING THEN IF YOUR ID IS GREATER THAN ANOTHER DON'T RENDER YOUR CONNECTIONS BC OTHER ID WILL
    constructor(user1, user2, strength) {
        this.user1 = user1;
        this.user2 = user2;
        this.strength = 8;
    }
    display(color, doShadow) {
        //ctx.globalAlpha -= 0.1;
        if (doShadow) {
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.lineWidth = this.strength * cameraZoom * 1.2;
            ctx.moveTo(posX(this.user1.pos.x), posY(this.user1.pos.y));
            ctx.lineTo(posX(this.user2.pos.x), posY(this.user2.pos.y));
            ctx.stroke();
        }
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.lineWidth = this.strength * cameraZoom;
        ctx.moveTo(posX(this.user1.pos.x), posY(this.user1.pos.y));
        ctx.lineTo(posX(this.user2.pos.x), posY(this.user2.pos.y));
        //ctx.lineTo(0,0)
        ctx.stroke();
        //ctx.globalAlpha = 1
    }
}

class Shell { // centerNode = actual king node, shell# 1-max count, radius = rad increasess, initcount = how many on first shell
    constructor(centerNode, shellNumber, initRadius, initCount) {
        this.centerNode = centerNode;
        this.shellNumber = shellNumber;
        this.radius = initRadius * shellNumber;
        this.count = initCount * shellNumber;
        this.x = centerNode.pos.x;
        this.y = centerNode.pos.y;
        this.children = []; // nodes belonging (ids)
        this.angles = []; // node angles
    }
    display() {
        ctx.strokeStyle = "white";
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = cameraZoom * 2;
        ctx.beginPath();
        ctx.arc(posX(this.x), posY(this.y), this.radius * cameraZoom, 0, 2 * Math.PI)
        ctx.stroke();
    }
    createAngles() { // after children are assigned
        let angle = Math.PI * 2 * Math.random();
        let d = Math.PI * 2 / this.children.length;
        for (let i = 0; i < this.children.length; i++) {
            angle += d;
            this.angles.push(angle);
        }
    }
}

function circ(x, y, r, c) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(posX(x), posY(y), r * cameraZoom, 0, 2 * Math.PI);
    ctx.fill();
    //alert(c)
}

export function posX(x) {
    return (x - cameraX) * cameraZoom + centerX;
}
export function posY(y) {
    return (y - cameraY) * cameraZoom + centerY;
}

export function reset() {
    setKing(null);
    setKingMode(false);
    zoomToKing = false;
    zoomedToKing.set(zoomToKing)
    setResetMode(true);
}

export function clearData() {
    slackIds = []
    slackConnections = []
}

export { Vector2, Node, Connection, Shell }
