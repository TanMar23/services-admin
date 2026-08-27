import { app } from './app.js'
import config from './config/env.config.js'


const PORT = config.port

// Línea que levanta o crea el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})