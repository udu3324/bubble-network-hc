<script>
    import { Vector2, Node, Connection, Shell, maxPos, randomSlackUser, gen, mapLoaded, websiteMode, king, nodes } from "$lib/visualizer";
    import { onMount } from "svelte";

    let divis
    let canvas

    let canvasWidth = 0
    let canvasHeight = 0

    var ctx
    var centerX
    var centerY

    var panOriginX = null
    var panOriginY = null
    var panX = 0
    var panY = 0

    var mouseX = 0
    var mouseY = 0

    var mouseDown = false
    var mouseMoving = false
    
    var userScroll = 0;
    var ds = 0; // velocity of scroll
    var df = 0.8; // friction for smoothness
    var cX = 0;
    var cY = 0;
    var scrolling = false
    var ticker = 0

    let mOffsetX = 0
    let mOffsetY = 0

    var cameraX = 0;
    var cameraY = 0;

    var cameraZoom = 0.05; // higher = zoomed in
    var inputZoom = 12; // relative to 10
    
    var prevCamX = null;
    var prevCamY = null;

    var targetX = 0;
    var targetY = 0;

    var cameraEase = 10;
    var zoomToKing = false; // when new focus put camera there
    var prevKing = null;

    onMount(() => {
        canvasWidth = divis.getBoundingClientRect().width
        canvasHeight = divis.getBoundingClientRect().height
        
        console.log(canvasWidth, canvasHeight)

        ctx = canvas.getContext('2d');
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;

        // ADD TO WHERE THE REDUCE CONNECTIONS WHEN ZOOMED OUT INCREASES CUT WHEN THERES MORE CONNECTIONS AVG
        if (!websiteMode) {
            for (let i = 0; i < 1000; i++) {
                randomSlackUser();
            }
            gen();
        }

        function resizeCanvas(width, height) {
            canvas.width = width
            canvas.height = heightt
        }

        function focusUser(slackId) {
            let i = slackIds.indexOf(slackId)
            king.set(i)
        }

        function posX(x) {
            return (x - cameraX) * cameraZoom + centerX;
        }
        function posY(y) {
            return (y - cameraY) * cameraZoom + centerY;
        }

        function tick() {
            ticker += 0.2;


            if (!mapLoaded) {
                return;
            }


            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(2, 31, 46)"
            ctx.fillStyle = "##0f172b"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Update positional constants
            centerX = canvas.width / 2;
            centerY = canvas.height / 2;

            cameraZoom += ds;
            ds *= df;

            if (cameraZoom < 0.01) { // max zoom out
                cameraZoom = 0.01;
                ds = 0;
            }
            if (cameraZoom > 10) { // max zoom in
                cameraZoom = 10;
                ds = 0;
            }
            //cameraZoom = Math.sin(tick) + 1;

            if (panOriginX != null) {
                zoomToKing = false;
                if (prevCamX == null) {
                    prevCamX = cameraX;
                    prevCamY = cameraY;
                }
                //cameraX = prevCamX - (panX - panOriginX)/cameraZoom;
                //cameraY = prevCamY - (panY - panOriginY)/cameraZoom;
                targetX = (prevCamX - (panX - panOriginX) / cameraZoom);
                targetY = (prevCamY - (panY - panOriginY) / cameraZoom)
                let dx = targetX - cameraX;
                let dy = targetY - cameraY;

                cameraX += dx / cameraEase;
                cameraY += dy / cameraEase;
            } else {
                if (prevCamX != null) {
                    prevCamX = null;
                }

                let dx = targetX - cameraX;
                let dy = targetY - cameraY;

                cameraX += dx / cameraEase;
                cameraY += dy / cameraEase;
                prevCamX = cameraX;
                prevCamY = cameraY;
            }
            
            if (zoomToKing) {
                cameraZoom += (0.2 - cameraZoom) / 30
                let tX = nodes[king].pos.x;
                let tY = nodes[king].pos.y;

                cameraX += (tX - cameraX) / 10;
                cameraY += (tY - cameraY) / 10;
                targetX = cameraX;
                targetY = cameraY;
            }

            //document.getElementById("d").innerHTML = panX + "," + panY;

            // if there is a king node, create the king circle, instant update after change
            if (king != prevKing) {
                prevKing = king;
                if (king != null) {
                    zoomToKing = true;
                    assembleKing()
                }
            }

            if (king != null) { // display shells and bring closer to king
                displayShells();
                surroundNodes();
            }

            // display the nodes
            displayNodes();

            mouseMoving = false;
        }

        function displayShells() {
            for (let i = 0; i < kingShells.length; i++) {
                kingShells[i].display();
            }
            //alert(kingShells.length)
        }

        function surroundNodes() {
            for (let i = 0; i < kingCircle.length; i++) {
                nodes[kingCircle[i]].approachShell()
            }
        }


        function circ(x, y, r, c) {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(posX(x), posY(y), r * cameraZoom, 0, 2 * Math.PI);
            ctx.fill();
            //alert(c)
        }

        function displayNodes() {
            //alert("h")
            taken = null;
            let circle = null;
            if (king != null) {
                taken = king;
            }
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].touch();
                if (nodes[i].circleTouched) {
                    circle = i;
                }
            }
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].renderConnections();
            }
            for (let i = 0; i < nodes.length; i++) {
                let temp = nodes[i];
                temp.display()
            }

            if (circle != null) {
                nodes[circle].drawInfoBox();
            }
        }

        function assembleKing() {
            // king circle = connections to the king
            var kingNode = nodes[king]
            kingCircle = kingNode.connectionIds;
            kingStrengths = kingNode.connectionStrength;

            // sort the powers array while keeping kingCircle array in same order

            for (let a = 0; a < kingStrengths.length; a++) {
                for (let i = 0; i < kingStrengths.length - a; i++) {
                    if (kingStrengths[i] < kingStrengths[i + 1]) {
                        let temp = kingStrengths[i];
                        kingStrengths[i] = kingStrengths[i + 1];
                        kingStrengths[i + 1] = temp;

                        temp = kingCircle[i];
                        kingCircle[i] = kingCircle[i + 1];
                        kingCircle[i + 1] = temp;
                    }
                }
            }
            // CREATE THE SHELLS


            // find needed # of shells
            kingShells = [];
            let numShells = 0;
            let slotsNeeded = kingCircle.length;
            while (true) {
                numShells++;
                slotsNeeded -= (numShells) * _shellInitCount;
                if (slotsNeeded <= 0) {
                    break;
                }
            }

            // create shells + assign nodes

            let overallIndex = 0;

            for (let i = 0; i < numShells; i++) {
                kingShells.push(new Shell(kingNode, i + 1, _shellInitRadius, _shellInitCount))
                let currentShell = kingShells[i];
                let nodesToAdd = (i + 1) * _shellInitCount;
                let x = 0;
                for (x = 0; x < nodesToAdd; x++) {
                    if (x + overallIndex >= kingCircle.length) {
                        break; // will also be end of overall for loop
                    }
                    let currentNode = nodes[kingCircle[x + overallIndex]]
                    currentShell.children.push(currentNode);
                    currentNode.assignShell(currentShell);


                }
                overallIndex += x;

                currentShell.createAngles();

            }
        }

        function reset() {
            king.set(null)
            zoomToKing = false;
        }

        canvas.addEventListener("wheel", function (e) {
            e.preventDefault();
            zoomToKing = false;
            if (scrolling == false) {
                scrolling = true;
                cX = mouseX;
                cY = mouseY;
                //zoomToKing = false;
            }
            if (event.deltaY > 0) { // zoom out
                //cameraZoom -= cameraZoom/10;
                ds = 0 - cameraZoom / 10;
            } else if (event.deltaY < 0) { // zoom in
                //cameraZoom += cameraZoom/10;
                ds = cameraZoom / 10;
            }
        });
        canvas.addEventListener('contextmenu', event => event.preventDefault());

        canvas.addEventListener('mousedown', function (e) {
            if (e.button == 2) { // right click
                if (panOriginX == null) {
                    panOriginX = e.clientX - mOffsetX;
                    panOriginY = e.clientY- mOffsetY;
                }
                panX = e.clientX - mOffsetX;
                panY = e.clientY;

                zoomToKing = false;

                mouseDown = false;

                document.body.style.cursor = "grab";
            } else {
                mouseDown = true;
            }

        })
        document.addEventListener("mousemove", function (e) {
            if (panOriginX != null) {
                panX = e.clientX - mOffsetX;
                panY = e.clientY - mOffsetY;

                zoomToKing = false;
            }
            mouseX = e.clientX - mOffsetX;
            mouseY = e.clientY- mOffsetY;

            mouseMoving = true;
        })
        document.addEventListener('mouseup', function (e) {
            if (e.button == 2) { // right click
                panOriginX = null;
                document.body.style.cursor = "auto";
            } else {
                mouseDown = false;
            }
        })

        function loop() {
            tick();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    })    
</script>

<div bind:this={divis} class="bg-slate-800 grow rounded-lg grid place-content-center">
    <!--<span class="text-slate-600 font-bold text-5xl text-center">network visualizer here</span>-->
    <canvas bind:this={canvas} width={canvasWidth} height={canvasHeight}></canvas>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    canvas {
        width: 100%;
        height: 100%;
    }
</style>