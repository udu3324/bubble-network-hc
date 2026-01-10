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
        kingMode,
        setKingMode,
        kingModeW,
        setCenters,
        reset,
        resetMode,
        setResetMode,
        clearData,
        slackConnections,
        setMasterArray,
        masterArray,
        doItBetter,
        gen,
        mapLoaded
    } from "$lib/visualizer";
    import { onMount } from "svelte";

    import { foobar1, foobar3 } from "../lib/supabaseClient";
    import { page } from "$app/stores";
    import { infoPanelVisible } from "$lib";

    let divis;
    let canvas;
    let canvasWidth = 0;
    let canvasHeight = 0;

    let hintsAreHidden = "hidden";
    let infoIsHidden = "hidden";
    let infoHiddenOverride = "";

    let mOffsetX = 0;
    let mOffsetY = 0;

    let mouseTimer = 0;
    let mouseClickedNode = false;

    let innerScreenWidth = 0;
    let innerScreenHeight = 0;

    let infoUsername = "";
    let infoSlackID = "";
    let infoConnections = "";
    let infoRank = "";
    let infoScanned = "";

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

            mOffsetX = divis.getBoundingClientRect().left;
            mOffsetY = divis.getBoundingClientRect().top;

            setCenters(canvasWidth / 2, canvasHeight / 2);
        }
    }

    let ticker = 0;
    let lastTime = performance.now();

    onMount(() => {
        
        if (!localStorage.getItem("hintsHidden")) {
            hintsAreHidden = "";
        }

        canvasWidth = divis.getBoundingClientRect().width;
        canvasHeight = divis.getBoundingClientRect().height;

        reactiveReady = true;

        //console.log(canvasWidth, canvasHeight);

        mOffsetX = divis.getBoundingClientRect().left;
        mOffsetY = divis.getBoundingClientRect().top; //canvas.getBoundingClientRect().top
        
        setCanvas(canvas, canvasWidth, canvasHeight);

        var inputZoom = 12; // relative to 10


        var prevCamX = null;
        var prevCamY = null;

        // HANDLE SLACK DATA
        


        // ADD TO WHERE THE REDUCE CONNECTIONS WHEN ZOOMED OUT INCREASES CUT WHEN THERES MORE CONNECTIONS AVG

        gen();
        //check if there's an id query in url
        let idQuery = $page.url.searchParams.get("id");
        if (idQuery) {
            if (slackIds.includes(idQuery)) {
                console.log("autofocus to", idQuery);
                setKing(slackIds.indexOf(idQuery));
            }
        }

        // OVERRIDE RANDOMNESS BY CALLING FOOBAR FUNCTIONS

        /*
        masterArray = foobar1();
        masterData = foobar3();
        */

        

        

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

        function tick(delta) {
            ticker += delta

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

            if (mouseDown) {
                mouseTimer += delta;
                //alert("yo")
            }
            console.log(mouseTimer);

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
                setResetMode(false);
                setCameraZoom(cameraZoom + (0.2 - cameraZoom) / 30);
                let tX = nodes[king].pos.x;
                let tY = nodes[king].pos.y;

                setCameraX(cameraX + (tX - cameraX) / 10);
                setCameraY(cameraY + (tY - cameraY) / 10);
                targetX = cameraX;
                targetY = cameraY;
            }

            if (resetMode) {
                setCameraZoom(cameraZoom + (0.05 - cameraZoom) / 30);

                targetX = cameraX;
                targetY = cameraY;
            }

            //document.getElementById("d").innerHTML = panX + "," + panY;

            // if there is a king node, create the king circle, instant update after change
            if (king != prevKing) {
                prevKing = king;
                if (king != null) {
                    setKingMode(true);

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
            let guyTouched = null;
            setTaken(null);
            let circle = null;
            if (king != null) {
                setTaken(king);
            }
            for (let i = 0; i < nodes.length; i++) {
                if (mouseClickedNode || document.body.style.cursor !== "grab") {
                    nodes[i].touch(mouseClickedNode);
                }

                if (nodes[i].circleTouched) {
                    circle = i;
                }
                if (nodes[i].touched) {
                    guyTouched = i;
                }
            }
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].renderConnections();
            }
            for (let i = 0; i < nodes.length; i++) {
                let temp = nodes[i];
                temp.display();
            }

            // do not draw info box while panning, smooth mode causes flashing
            if (document.body.style.cursor === "grab") {
                return;
            }

            if (circle != null) {
                nodes[circle].drawInfoBox();
            }
            if (guyTouched != null) {
                nodes[guyTouched].drawInfoBox();
            }

            if (mouseClickedNode) {
                mouseClickedNode = false;
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
            setResetMode(false);
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
            } else {
                // left click
                if (panOriginX == null) {
                    panOriginX = e.clientX - mOffsetX;
                    panOriginY = e.clientY - mOffsetY;
                }
                panX = e.clientX - mOffsetX;
                panY = e.clientY - mOffsetY;

                

                setZoomToKing(false);

                if (!mouseDown) {
                    mouseTimer = 0; // reset timer if first time pressing
                }
                setMouseDown(true);

                setResetMode(false);

                document.body.style.cursor = "grab";
            }
        });
        document.addEventListener("mousemove", function (e) {
            if (panOriginX != null) {
                panX = e.clientX - mOffsetX;
                panY = e.clientY - mOffsetY;

                setZoomToKing(false);
                setResetMode(false);
            }
            setMouseX(e.clientX - mOffsetX);
            setMouseY(e.clientY - mOffsetY);
        });
        document.addEventListener("mouseup", function (e) {
            if (e.button == 2) {
                // right click

                setMouseDown(false);
            } else {
                setMouseDown(false);
                if (mouseTimer < 150) {
                    mouseClickedNode = true;

                    if (king && kingModeW) {
                        console.log("exiting", mouseTimer, document.body.style.cursor)
                        reset();
                    }
                }
                
                // left click
                panOriginX = null;
                document.body.style.cursor = "auto";
            }
        });

        function loop(now) {
            const delta = now - lastTime;
            lastTime = now;

            tick(delta);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    });

    function hide() {
        console.log("hiding control hint panel");
        localStorage.setItem("hintsHidden", "yes");

        hintsAreHidden = "hidden";
    }

    kingModeW.subscribe((zoomed) => {
        if (zoomed) {
            //reset info
            infoUsername = "";
            infoSlackID = "";
            infoConnections = "";
            infoRank = "";
            infoScanned = "";

            let info = masterData.find(
                (item) => item.slack_id === slackIds[king],
            );
            let bubble = masterArray.find(
                (item) => item.slack_id === slackIds[king],
            );
            console.log("bubble is", bubble);
            infoIsHidden = "";

            infoUsername = info.username;
            infoSlackID = info.slack_id;
            if (bubble) {
                infoConnections = bubble.id_list.length;
                infoRank =
                    masterArray.findIndex(
                        (item) => item.slack_id === slackIds[king],
                    ) + 1;
                infoScanned = "true";
            } else {
                infoScanned = "false";
                infoRank = "n/a";
                infoConnections = "n/a";
            }
        } else {
            infoIsHidden = "hidden";
        }
    });

    infoPanelVisible.subscribe((bool) => {
        if (bool) {
            infoHiddenOverride = "";
        } else {
            infoHiddenOverride = "hidden";
        }
    });
</script>

<svelte:window
    bind:innerWidth={innerScreenWidth}
    bind:innerHeight={innerScreenHeight}
/>

<div
    bind:this={divis}
    class="bg-slate-800 grow rounded-lg relative place-content-center overflow-clip"
>
    <div class="absolute inset-0 grid place-content-center text-center">
        <!-- <span class="text-slate-600 font-bold text-5xl text-center">network visualizer here</span> -->
        <span class="text-slate-600 font-bold text-5xl text-center">
            loading network visualizer
            <br />
            <i class="fa-solid fa-spinner animate-spin text-9xl mt-5"></i>
        </span>
    </div>

    <canvas bind:this={canvas} width={canvasWidth} height={canvasHeight}
    ></canvas>

    <button
        on:click={hide}
        class="{hintsAreHidden} absolute z-30 p-3 m-3 right-0 bottom-0 bg-black/40 text-white cursor-pointer text-left"
    >
        <h1 class="font-bold">control hints</h1>
        <span>left click - pan, focus, reset view</span>
        <br />
        <span>scroll - zoom in and out</span>
        <br />
    </button>

    <div
        class="{infoIsHidden} {infoHiddenOverride} absolute z-30 p-3 m-3 left-0 bottom-0 bg-black/40 text-white pointer-events-none"
    >
        <div class="grid grid-cols-[max-content_auto] gap-x-2 gap-y-1">
            <span class="base">username: </span>
            <span class="info">{infoUsername}</span>

            <span class="base">slack id: </span>
            <span class="info">{infoSlackID}</span>

            <span class="base">connections: </span>
            <span class="info">{infoConnections}</span>

            <span class="base">rank: </span>
            <span class="info">{infoRank}</span>

            <span class="base">scanned: </span>
            <span class="info">{infoScanned}</span>
        </div>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    canvas {
        @apply absolute inset-0 grid place-content-center;
        z-index: 10;
        width: 100%;
        height: 100%;
    }

    .base {
        @apply font-light text-right;
    }

    .info {
        @apply text-base font-normal;
    }
</style>
