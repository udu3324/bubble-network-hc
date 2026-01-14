// place files you want to import through the `$lib` alias in this folder.

import { replaceState } from "$app/navigation"
import { resolve } from "$app/paths"
import { writable } from "svelte/store"
import { page } from "$app/state"

export const isAuthed = writable(false)

export const hasData = writable(false)

export let infoPanelVisible = writable(true)

export let renderIt = writable(false)

export function modifyURLParams(id) {
    const url = new URL(page.url)

    if (id) {
        url.searchParams.set('id', id)
        replaceState(resolve(url.pathname + url.search), page.state)
    } else {
         url.searchParams.delete('id')
        replaceState(resolve(url.pathname + url.search), page.state)
    }
}