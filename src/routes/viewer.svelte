<script>
    import {
        cameraZoom,
        king,
        masterData,
        setCanvas,
        setKing,
        setMouseX,
        setMouseY,
        setMouseDown,
        slackIds,
        setZoomToKing,
        kingModeW,
        setCenters,
        reset,
        setResetMode,
        masterArray,
        gen,
        tick,
        panOriginX,
        setPanOriginX,
        setPanOriginY,
        setDS,
        setPanX,
        setPanY,
        mouseTimer,
        setMouseClickedNode
    } from "$lib/visualizer"
    import { onMount } from "svelte"

    import { page } from "$app/stores"
    import { infoPanelVisible } from "$lib"

    // svelte element stuff

    let divis
    let canvas
    let canvasWidth = 0
    let canvasHeight = 0

    let innerScreenWidth = 0
    let innerScreenHeight = 0

    let hintsAreHidden = "hidden"
    let infoIsHidden = "hidden"
    let infoHiddenOverride = ""

    let infoUsername = ""
    let infoSlackID = ""
    let infoConnections = ""
    let infoRank = ""
    let infoScanned = ""

    let reactiveReady = false
    $: {
        if ((innerScreenWidth || innerScreenHeight) && reactiveReady) {
            canvasWidth = divis.getBoundingClientRect().width
            canvasHeight = divis.getBoundingClientRect().height

            mOffsetX = divis.getBoundingClientRect().left
            mOffsetY = divis.getBoundingClientRect().top

            setCenters(canvasWidth / 2, canvasHeight / 2)
        }
    }

    // canvas stuff

    let mOffsetX = 0
    let mOffsetY = 0
    
    let lastTime = performance.now()

    let scrolling = false

    onMount(() => {
        console.log("visualizer component mounted")
        
        if (!localStorage.getItem("hintsHidden")) {
            hintsAreHidden = ""
        }

        canvasWidth = divis.getBoundingClientRect().width
        canvasHeight = divis.getBoundingClientRect().height

        reactiveReady = true

        //console.log(canvasWidth, canvasHeight)

        mOffsetX = divis.getBoundingClientRect().left
        mOffsetY = divis.getBoundingClientRect().top //canvas.getBoundingClientRect().top
        
        setCanvas(canvas, canvasWidth, canvasHeight)

        // generate canvas stuff
        gen().then(() => {
            //check if there's an id query in url
            let idQuery = $page.url.searchParams.get("id")
            if (idQuery) {
                if (slackIds.includes(idQuery)) {
                    console.log("autofocus to", idQuery)
                    setKing(slackIds.indexOf(idQuery))
                }
            }
        })

        // ADD TO WHERE THE REDUCE CONNECTIONS WHEN ZOOMED OUT INCREASES CUT WHEN THERES MORE CONNECTIONS AVG

        function loop(now) {
            const delta = now - lastTime
            lastTime = now

            tick(delta)
            requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
    })

    infoPanelVisible.subscribe((bool) => {
        infoHiddenOverride = bool ? "" : "hidden"
    })

    kingModeW.subscribe((zoomed) => {
        if (zoomed) {
            //reset info
            infoUsername = ""
            infoSlackID = ""
            infoConnections = ""
            infoRank = ""
            infoScanned = ""

            let info = masterData.find(
                (item) => item.slack_id === slackIds[king],
            )
            let bubble = masterArray.find(
                (item) => item.slack_id === slackIds[king],
            )
            console.log("bubble is", bubble)
            infoIsHidden = ""

            infoUsername = info.username
            infoSlackID = info.slack_id
            if (bubble) {
                infoConnections = bubble.id_list.length
                infoRank =
                    masterArray.findIndex(
                        (item) => item.slack_id === slackIds[king],
                    ) + 1
                infoScanned = "true"
            } else {
                infoScanned = "false"
                infoRank = "n/a"
                infoConnections = "n/a"
            }
        } else {
            infoIsHidden = "hidden"
        }
    })

    function hide() {
        console.log("hiding control hint panel")
        localStorage.setItem("hintsHidden", "yes")

        hintsAreHidden = "hidden"
    }

    function mouseWheelHandler(e) {
        e.preventDefault()

        setZoomToKing(false)
        setResetMode(false)

        if (scrolling == false) {
            scrolling = true
            //setZoomToKing(false)
        }
        if (event.deltaY > 0) {
            // zoom out
            //cameraZoom -= cameraZoom/10
            setDS(0 - cameraZoom / 10)
        } else if (event.deltaY < 0) {
            // zoom in
            //cameraZoom += cameraZoom/10
            setDS(cameraZoom / 10)
        }
    }

    function mouseDownHandler(e) {
        if (e.button === 0) { // left click
            if (panOriginX == null) {
                setPanOriginX(e.clientX - mOffsetX)
                setPanOriginY(e.clientY - mOffsetY)
            }
            setPanX(e.clientX - mOffsetX)
            setPanY(e.clientY - mOffsetY)

            setZoomToKing(false)
            setMouseDown(true)
            setResetMode(false)

            document.body.style.cursor = "grab"
        }
    }

    function mouseUpHandler(e) {
        if (e.button === 0) { //left click
            setMouseDown(false)
            if (mouseTimer < 150) {
                setMouseClickedNode(true)

                if (king && kingModeW) {
                    console.log("exiting", mouseTimer, document.body.style.cursor)
                    reset()
                }
            }
            
            setPanOriginX(null)
            document.body.style.cursor = "auto"
        }
    }

    function mouseMoveHandler(e) {
        if (panOriginX != null) {
            setPanX(e.clientX - mOffsetX)
            setPanY(e.clientY - mOffsetY)

            setZoomToKing(false)
            setResetMode(false)
        }
        setMouseX(e.clientX - mOffsetX)
        setMouseY(e.clientY - mOffsetY)
    }
</script>

<svelte:window
    bind:innerWidth={innerScreenWidth}
    bind:innerHeight={innerScreenHeight}
/>

<div
    bind:this={divis}
    class="bg-slate-800 select-none grow rounded-lg relative place-content-center overflow-clip"
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
    on:wheel={mouseWheelHandler} on:mousedown={mouseDownHandler}
    on:mouseup={mouseUpHandler} on:mousemove={mouseMoveHandler}
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
