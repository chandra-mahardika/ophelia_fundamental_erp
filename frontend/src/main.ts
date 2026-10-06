/**
 * Entry point frontend: mount komponen root `App` ke DOM.
 * `app.css` sudah menarik tema global + class komponen.
 */
import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
