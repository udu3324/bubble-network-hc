<script>
    import {
        cameraX,
        cameraY,
        cameraZoom,
        centerX,
        centerY,
        Connection,
        ctx,
        king,
        masterData,
        setMasterData,
        maxPos,
        mouseX,
        mouseY,
        mouseDown,
        Node,
        nodes,
        posX,
        posY,
        setCameraX,
        setCameraY,
        setCameraZoom,
        setCanvas,
        setKing,
        setMouseX,
        setMouseY,
        setMouseDown,
        setTaken,
        Shell,
        slackIds,
        taken,
        Vector2,
        setMaxPos,
        kingCircle,
        resetKingCircle,
        pushKingCircle,
        setKingCircle,
        setZoomToKing,
        zoomToKing,
        dataSlackIds,
        dataIndexes,
    } from "$lib/visualizer";
    import { onMount } from "svelte";

    import { foobar1, foobar3 } from "../lib/supabaseClient";

    let divis;
    let canvas;
    let canvasWidth = 0;
    let canvasHeight = 0;

    let innerScreenWidth = 0;
    let innerScreenHeight = 0;

    // other stuff rowan did while drunk
    var panOriginX = null;
    var panOriginY = null;
    var panX = 0;
    var panY = 0;

    let reactiveReady = false;
    $: {
        if ((innerScreenWidth || innerScreenHeight) && reactiveReady) {
            canvasWidth = divis.getBoundingClientRect().width;
            canvasHeight = divis.getBoundingClientRect().height;
        }
    }

    onMount(() => {
        canvasWidth = divis.getBoundingClientRect().width;
        canvasHeight = divis.getBoundingClientRect().height;

        reactiveReady = true;

        console.log(canvasWidth, canvasHeight);

        function focusUser(slackId) {
            setKing(slackIds.indexOf(slackId));
        }

        var mOffsetX = divis.getBoundingClientRect().left;
        var mOffsetY = divis.getBoundingClientRect().top; //canvas.getBoundingClientRect().top
        console.log(canvas.getBoundingClientRect());
        console.log(divis.getBoundingClientRect());

        const websiteMode = true; // turn on when using server data, off when using random data (need to call gen() function for website)

        setCanvas(canvas, canvasWidth, canvasHeight);

        var inputZoom = 12; // relative to 10

        var mapLoaded = false;

        var prevCamX = null;
        var prevCamY = null;

        // random names and images for testing
        var names = ["Amigo", "Friend", "Lonely", "Hacker"];
        var images = []; // contains urls
        images.push(
            "https://images.pexels.com/photos/33713697/pexels-photo-33713697.jpeg",
        );
        images.push(
            "https://images.pexels.com/photos/35175266/pexels-photo-35175266.jpeg",
        );
        images.push(
            "https://images.pexels.com/photos/19829670/pexels-photo-19829670.jpeg",
        );
        images.push(
            "https://images.pexels.com/photos/35201958/pexels-photo-35201958.jpeg",
        );
        images.push(
            "https://images.pexels.com/photos/35109039/pexels-photo-35109039.jpeg",
        );

        let masterArray = [];

        // HANDLE SLACK DATA

        var slackConnections = [];
        var slackConnectionStrengths = []; // randomly generated

        function randomSlackUser() {
            let id = Math.random() + "";
            masterArray.push({
                slack_id: id,
                id_list: [],
                id_list_special: null,
            });
            let myId = masterArray.length - 1;
            let usedFriends = [];
            for (let i = 0; i < 20; i++) {
                let randomFriend = Math.floor(
                    Math.random() * masterArray.length,
                );

                if (!usedFriends.includes(randomFriend)) {
                    masterArray[randomFriend].id_list.push(id);
                    masterArray[myId].id_list.push(
                        masterArray[randomFriend].slack_id,
                    );
                }
                usedFriends.push(randomFriend);
            }
            // create random username

            masterData.push({
                slack_id: id,
                username: names[Math.floor(Math.random() * names.length)],
                profile_picture:
                    images[Math.floor(Math.random() * images.length)],
            });
        }

        // ADD TO WHERE THE REDUCE CONNECTIONS WHEN ZOOMED OUT INCREASES CUT WHEN THERES MORE CONNECTIONS AVG
        if (!websiteMode) {
            for (let i = 0; i < 1000; i++) {
                randomSlackUser();
            }
            gen();
        } else {
            gen();
        }

        // OVERRIDE RANDOMNESS BY CALLING FOOBAR FUNCTIONS

        /*
        masterArray = foobar1();
        masterData = foobar3();
        */

        function doItBetter() {
            // iterate throught he data to createa a general list of slack ids to resort back to
            // then, get connections through the master array (slack ids will be aligned with the data)
            // finally, create the slackconnections array

            // step 1
            for (let i = 0; i < masterData.length; i++) {
                slackIds.push(masterData[i].slack_id);
                slackConnections.push([]);
            }

            // step 2 + step 3?

            for (let i = 0; i < masterArray.length; i++) {
                // assuming not the entire map of slack, a few people, derive connections
                let masterNode = masterArray[i];
                let masterSlackId = masterNode.slack_id;
                let masterConnections = masterNode.id_list;

                for (let x = 0; x < masterConnections.length; x++) {
                    // update connection for the other person
                    let target = slackIds.indexOf(masterConnections[x]);
                    if (target > -1) {
                        //console.log(slackConnections.length + " -> " + target);
                        if (!slackConnections[target].includes(masterSlackId)) {
                            slackConnections[target].push(masterSlackId);
                        }
                    }

                    // update connection for the master man
                    slackConnections[slackIds.indexOf(masterSlackId)] = masterConnections;
                }
            }

            //console.log(slackConnections);
        }

        async function gen() {
            // IF ON WEBSITE MODE, TAKE DATA FROM THE SERVER
            if (websiteMode) {
                masterArray = await foobar1();
                //alert(masterArray)
                setMasterData(await foobar3());
                //alert(masterData.length)
            }

            //compileData();
            //doEverythingICant();
            doItBetter();
            //return;
            // DERIVE IDS, CONNECTIONS FROM MASTER
            setMaxPos(2000 + slackIds.length * 8);

            // Eleminate any ids in connections that don't exist
            for (let i = 0; i < slackConnections.length; i++) {
                let nodeConnections = slackConnections[i];
                for (let j = nodeConnections.length - 1; j >= 0; j--) {
                    if (
                        !slackIds.includes(nodeConnections[j]) ||
                        nodeConnections[j] == slackIds[i]
                    ) {
                        nodeConnections.splice(j, 1);
                    }
                }
                slackConnections[i] = nodeConnections;

                // Create randomly generated strengths for each connection

                let randomStrengths = [];
                for (let x = 0; x < nodeConnections.length; x++) {
                    randomStrengths.push(Math.ceil(Math.random() * 100));
                }
                slackConnectionStrengths.push(randomStrengths);

                // constructor(slackId, connections, id, connectionStrength)
                nodes.push(
                    new Node(
                        slackIds[i],
                        slackConnections[i],
                        i,
                        slackConnectionStrengths[i],
                    ),
                );
            }

            // generate connections for each node (visual)
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].generateConnections();
            }

            mapLoaded = true;
        }

        // for smoothness
        var targetX = 0;
        var targetY = 0;
        var cameraEase = 10;

        // KINGNODE -> NODE THAT ENTIRE PROGRAM REVOLVES AROUND

        var kingStrengths = [];
        var prevKing = null;

        var kingShells = []; // shells to hold the nodes

        // shell constants
        const _shellInitCount = 3;
        const _shellInitRadius = 200;

        var ticker = 0;
        function tick() {
            ticker += 0.2;

            if (!mapLoaded) {
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(2, 31, 46)";
            ctx.fillStyle = "##0f172b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 40, 0, 2 * Math.PI);
            ctx.stroke();

            setCameraZoom(cameraZoom + ds);
            ds *= df;

            if (cameraZoom < 0.01) {
                // max zoom out
                setCameraZoom(0.01);
                ds = 0;
            }
            if (cameraZoom > 10) {
                // max zoom in
                setCameraZoom(10);
                ds = 0;
            }
            //cameraZoom = Math.sin(tick) + 1;

            if (panOriginX != null) {
                setZoomToKing(false);
                if (prevCamX == null) {
                    prevCamX = cameraX;
                    prevCamY = cameraY;
                }
                //cameraX = prevCamX - (panX - panOriginX)/cameraZoom;
                //cameraY = prevCamY - (panY - panOriginY)/cameraZoom;
                targetX = prevCamX - (panX - panOriginX) / cameraZoom;
                targetY = prevCamY - (panY - panOriginY) / cameraZoom;
                let dx = targetX - cameraX;
                let dy = targetY - cameraY;

                setCameraX(cameraX + dx / cameraEase);
                setCameraY(cameraY + dy / cameraEase);
            } else {
                if (prevCamX != null) {
                    prevCamX = null;
                }

                let dx = targetX - cameraX;
                let dy = targetY - cameraY;

                setCameraX(cameraX + dx / cameraEase);
                setCameraY(cameraY + dy / cameraEase);
                prevCamX = cameraX;
                prevCamY = cameraY;
            }

            if (zoomToKing) {
                setCameraZoom(cameraZoom + (0.2 - cameraZoom) / 30);
                let tX = nodes[king].pos.x;
                let tY = nodes[king].pos.y;

                setCameraX(cameraX + (tX - cameraX) / 10);
                setCameraY(cameraY + (tY - cameraY) / 10);
                targetX = cameraX;
                targetY = cameraY;
            }

            //document.getElementById("d").innerHTML = panX + "," + panY;

            // if there is a king node, create the king circle, instant update after change
            if (king != prevKing) {
                prevKing = king;
                if (king != null) {
                    setZoomToKing(true);
                    assembleKing();
                }
            }

            if (king != null) {
                // display shells and bring closer to king
                displayShells();
                surroundNodes();
            }

            // display the nodes

            displayNodes();
        }

        function displayShells() {
            for (let i = 0; i < kingShells.length; i++) {
                kingShells[i].display();
            }
            //alert(kingShells.length)
        }

        function surroundNodes() {
            for (let i = 0; i < kingCircle.length; i++) {
                nodes[kingCircle[i]].approachShell();
            }
        }

        function displayNodes() {
            //alert("h")
            setTaken(null);
            let circle = null;
            if (king != null) {
                setTaken(king);
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
                temp.display();
            }

            if (circle != null) {
                nodes[circle].drawInfoBox();
            }
        }

        function assembleKing() {
            // king circle = connections to the king
            var kingNode = nodes[king];
            //kingCircle = kingNode.connectionIds;
            setKingCircle(kingNode.connectionIds);
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
                slotsNeeded -= numShells * _shellInitCount;
                if (slotsNeeded <= 0) {
                    break;
                }
            }

            // create shells + assign nodes

            let overallIndex = 0;

            for (let i = 0; i < numShells; i++) {
                kingShells.push(
                    new Shell(
                        kingNode,
                        i + 1,
                        _shellInitRadius,
                        _shellInitCount,
                    ),
                );
                let currentShell = kingShells[i];
                let nodesToAdd = (i + 1) * _shellInitCount;
                let x = 0;
                for (x = 0; x < nodesToAdd; x++) {
                    if (x + overallIndex >= kingCircle.length) {
                        break; // will also be end of overall for loop
                    }
                    let currentNode = nodes[kingCircle[x + overallIndex]];
                    currentShell.children.push(currentNode);
                    currentNode.assignShell(currentShell);
                }
                overallIndex += x;

                currentShell.createAngles();
            }
        }

        // might be better to render shapes at center of shape instead of corner as well

        var userScroll = 0;
        var ds = 0; // velocity of scroll
        var df = 0.8; // friction for smoothness
        var cX = 0;
        var cY = 0;
        var scrolling = false;
        canvas.addEventListener("wheel", function (e) {
            e.preventDefault();
            setZoomToKing(false);
            if (scrolling == false) {
                scrolling = true;
                cX = mouseX;
                cY = mouseY;
                //setZoomToKing(false)
            }
            if (event.deltaY > 0) {
                // zoom out
                //cameraZoom -= cameraZoom/10;
                ds = 0 - cameraZoom / 10;
            } else if (event.deltaY < 0) {
                // zoom in
                //cameraZoom += cameraZoom/10;
                ds = cameraZoom / 10;
            }
        });
        document.addEventListener("contextmenu", (event) =>
            event.preventDefault(),
        );

        canvas.addEventListener("mousedown", function (e) {
            if (e.button == 2) {
                // right click
                if (panOriginX == null) {
                    panOriginX = e.clientX - mOffsetX;
                    panOriginY = e.clientY - mOffsetY;
                }
                panX = e.clientX - mOffsetX;
                panY = e.clientY;

                setZoomToKing(false);

                setMouseDown(false);

                document.body.style.cursor = "grab";
            } else {
                setMouseDown(true);
            }
        });
        document.addEventListener("mousemove", function (e) {
            if (panOriginX != null) {
                panX = e.clientX - mOffsetX;
                panY = e.clientY - mOffsetY;

                setZoomToKing(false);
            }
            setMouseX(e.clientX - mOffsetX);
            setMouseY(e.clientY - mOffsetY);
        });
        document.addEventListener("mouseup", function (e) {
            if (e.button == 2) {
                // right click
                panOriginX = null;
                document.body.style.cursor = "auto";
            } else {
                setMouseDown(false);
            }
        });

        function loop() {
            tick();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    });
</script>

<svelte:window
    bind:innerWidth={innerScreenWidth}
    bind:innerHeight={innerScreenHeight}
/>

<div
    bind:this={divis}
    class="bg-slate-800 grow rounded-lg grid place-content-center overflow-clip"
>
    <!--<span class="text-slate-600 font-bold text-5xl text-center">network visualizer here</span>-->
    <canvas bind:this={canvas} width={canvasWidth} height={canvasHeight}
    ></canvas>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    canvas {
        width: 100%;
        height: 100%;
    }
</style>
