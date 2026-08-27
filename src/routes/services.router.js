import { Router } from "express"
import { readFileSync } from "node:fs"
import ServiceManager from "../managers/ServiceManager.js"

const router = Router()

const { services } = JSON.parse(readFileSync(new URL('../data/services.json', import.meta.url))
)

const manager = new ServiceManager(services)


router.get("/", (req, res) => {
    const { category, available } = req.query
    // router llama a un método del manager
    const data = manager.getServices({category, available})
      return res.status(200).json({
        status: "success",
        data
    })
})

router.get("/:sid", (req, res) => {
    const { sid } = req.params
    const data = manager.getServiceById(sid)

    if (data === null) {
        return res.status(404).json({
            status: "error",
            message: `Elemento con id ${sid} no encontrado`
        })

    }
    return res.status(200).json({
        status: "success",
        data
    })
})

router.post("/", (req, res) => {
    const newServiceData = manager.addService(req.body)

    if (newServiceData === null) {
        return res.status(400).json({
            status: "error", 
            message: "Error, no fue posible crear nuevo elemento"
        })
    }

    return res.status(201).json({
        status: "success",
        data: newServiceData,
        message: "Nuevo elemento creado exitosamente"
    })
})

router.put("/:sid", (req, res) => {
    const { sid } = req.params
    const updatedData = manager.updateService(sid, req.body)

    if (updatedData === null) {
        return res.status(404).json({
            status: "error",
            message: "Error: el recurso a actualizar no existe"
        })
    }

     if (updatedData === "INVALID_ID") {
        return res.status(400).json({
            status: "error",
            message: "Error: intentaste modificar el id"
        })
    }

    return res.status(200).json({
        status: "success",
        data: updatedData,
        message: 'Elemento actualizado exitosamente'
    })

})

router.delete("/:sid", (req, res) => {
    const { sid } = req.params
    const deleteItem = manager.deleteService(sid)

    if (deleteItem === null) {
        return res.status(404).json({
          status: "error",
          message: "Error al borrar elemento"  
        })
    }
    return res.status(200).json({
        status: "success",
        message: `Elemento con id ${sid} eliminado exitosamente`
    })
})


export default router