import './style.css'
import { createComponent } from 'tinybubble'
import './router.js'   // registers $route on globals
import App from './components/App.js'

createComponent(App).appendTo(document.getElementById('app'))
