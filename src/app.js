import express from 'express'
import servicesRouter from './routes/services.router.js'

// Puede tener al mismo tiempo:
// - rutas propias, definidas directamente con app.get(...), app.post(...), etc
// - Uno o varios routers montados con app.use(basePath, router), cada uno con su propio prefijo
export const app = express()
app.use(express.json())


// No tiene el prefijo /api/services porque no vive dentro de services.router.js (servicesRouter)
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "API del sistema de turnos y reservas con PORT"
    })
})


// Solo afecta a las rutas que están definidas dentro de servicesRouter, es decir, solo esas rutas tendrán el prefijo de /api/services
app.use("/api/services", servicesRouter)

