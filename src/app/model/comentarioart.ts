export interface comentarioartModel {
    id: number
    contenido: string
    idArticulo: number
    idUsuario: number
}

export interface articuloModel {
    id: number
    descripcion: string
    precio: number
    descuento: number
    imagen: any
}

export interface usuarioModel {
    id: number
    nombre: string
    apellido1: string
    apellido2: string
    username: string
    password: string
    fechaAlta: string
    genero: number
}
