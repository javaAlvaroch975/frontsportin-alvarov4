# API REST - Gesportin

## Resumen
- Base URL: http://localhost:8089
- CORS: habilitado para todos los orígenes (*)
- Claves foráneas (`@ManyToOne`) se devuelven como objetos expandidos (p. ej. `usuario.club`, `equipo.categoria`).
- Colecciones `@OneToMany` se exponen como contadores enteros: comentarios, puntuaciones, carritos, compras, ligas, etc.
- Fechas con `@JsonFormat` usan el patrón `yyyy-MM-dd HH:mm:ss`.
- Paginación: cuando el controlador usa `@PageableDefault(size = 1000)`, el `size` por defecto es 1000; en otros casos aplica el valor por defecto de Spring si no se envía `size`.
- Estructura de página:
```json
{
  "content": [ /* elementos */ ],
  "totalElements": 0,
  "totalPages": 0,
  "size": 1000,
  "number": 0,
  "sort": { /* orden */ }
}
```

## Índice rápido
1. Autenticación
2. Usuarios
3. Tipos de Usuario
4. Roles de Usuario
5. Clubes
6. Equipos
7. Jugadores
8. Categorías
9. Temporadas
10. Ligas
11. Partidos
12. Noticias
13. Comentarios
14. Comentarios de Artículos
15. Puntuaciones
16. Artículos
17. Tipos de Artículo
18. Carrito
19. Facturas
20. Compras
21. Cuotas
22. Pagos

---

## 1. Autenticación
- POST /session/login — body: `{ "username", "password" }` → `TokenBean { token }`
- GET /session/check — devuelve `true` si hay sesión activa, `false` si no.

---

## 2. Usuarios
Modelo: `id`, `nombre`, `apellido1`, `apellido2`, `username`, `password`, `fechaAlta`, `genero`, `tipousuario` (objeto), `rolusuario` (objeto), `club` (objeto), contadores `comentarios`, `puntuaciones`, `comentarioarts`, `carritos`, `facturas`.

Endpoints:
- GET /usuario/{id}
- GET /usuario?page&size&sort&nombre&username&idTipousuario&idClub&idRol (size por defecto 1000)
- POST /usuario
- PUT /usuario
- DELETE /usuario/{id}
- POST /usuario/fill/{cantidad}
- DELETE /usuario/empty
- GET /usuario/count

---

## 3. Tipos de Usuario
Modelo: `id`, `descripcion`, contador `usuarios`.

Endpoints:
- GET /tipousuario/{id}
- GET /tipousuario (lista completa)
- GET /tipousuario/fill
- DELETE /tipousuario/empty
- GET /tipousuario/count

---

## 4. Roles de Usuario
Modelo: `id`, `descripcion`, contador `usuarios`.

Endpoints:
- GET /rolusuario/{id}
- GET /rolusuario/all (lista completa)
- GET /rolusuario?page&size&sort&descripcion (size por defecto 1000)
- POST /rolusuario
- PUT /rolusuario
- DELETE /rolusuario/{id}
- POST /rolusuario/fill
- DELETE /rolusuario/empty
- GET /rolusuario/count

---

## 5. Clubes
Modelo: `id`, `nombre`, `direccion`, `telefono`, `fechaAlta`, `imagen` (blob), contadores `temporadas`, `noticias`, `tipoarticulos`, `usuarios`.

Endpoints:
- GET /club/{id}
- GET /club?page&size&sort
- POST /club
- PUT /club
- DELETE /club/{id}
- POST /club/fill/{cantidad}
- DELETE /club/empty
- GET /club/count

---

## 6. Equipos
Modelo: `id`, `nombre`, `categoria` (objeto), `entrenador` (usuario expandido), contadores `jugadores`, `cuotas`, `ligas`.

Endpoints:
- GET /equipo/{id}
- GET /equipo?page&size&sort&description&idCuota&idUsuario
- POST /equipo
- PUT /equipo
- DELETE /equipo/{id}
- POST /equipo/fill/{cantidad}
- DELETE /equipo/empty
- GET /equipo/count

---

## 7. Jugadores
Modelo: `id`, `dorsal`, `posicion`, `capitan`, `imagen`, `usuario` (objeto), `equipo` (objeto), contador `pagos`.

Endpoints:
- GET /jugador/{id}
- GET /jugador?page&size&sort&posicion&idUsuario&idEquipo (size por defecto 1000)
- POST /jugador
- PUT /jugador
- DELETE /jugador/{id}
- POST /jugador/fill/{cantidad}
- DELETE /jugador/empty
- GET /jugador/count

---

## 8. Categorías
Modelo: `id`, `nombre`, `temporada` (objeto), contador `equipos`.

Endpoints:
- GET /categoria/{id}
- GET /categoria?page&size&sort&nombre&id_temporada
- POST /categoria
- PUT /categoria
- DELETE /categoria/{id}
- POST /categoria/fill/{cantidad}
- DELETE /categoria/empty
- GET /categoria/count

---

## 9. Temporadas
Modelo: `id`, `descripcion`, `club` (objeto), contador `categorias`.

Endpoints:
- GET /temporada/{id}
- GET /temporada?page&size&sort&descripcion&id_club (size por defecto 1000)
- POST /temporada
- PUT /temporada
- DELETE /temporada/{id}
- POST /temporada/fill/{cantidad}
- DELETE /temporada/empty
- GET /temporada/count

---

## 10. Ligas
Modelo: `id`, `nombre`, `equipo` (objeto), contador `partidos`.

Endpoints:
- GET /liga/{id}
- GET /liga?page&size&sort&nombre&idEquipo (size por defecto 1000)
- POST /liga
- PUT /liga
- DELETE /liga/{id}
- POST /liga/fill/{cantidad}
- DELETE /liga/empty
- GET /liga/count

---

## 11. Partidos
Modelo: `id`, `rival`, `liga` (objeto), `local`, `resultado`.

Endpoints:
- GET /partido/{id}
- GET /partido?page&size&sort&id_liga
- POST /partido
- PUT /partido
- DELETE /partido/{id}
- POST /partido/fill/{cantidad}
- DELETE /partido/empty
- GET /partido/count

---

## 12. Noticias
Modelo: `id`, `titulo`, `contenido`, `fecha`, `imagen`, `club` (objeto), contadores `comentarios`, `puntuaciones`.

Endpoints:
- GET /noticia/{id}
- GET /noticia?page&size&sort&contenido&idClub (size por defecto 1000)
- POST /noticia
- PUT /noticia
- DELETE /noticia/{id}
- POST /noticia/fill/{cantidad}
- DELETE /noticia/empty
- GET /noticia/count

---

## 13. Comentarios
Modelo: `id`, `contenido`, `noticia` (objeto), `usuario` (objeto).

Endpoints:
- GET /comentario/{id}
- GET /comentario?page&size&sort&contenido&idUsuario&idNoticia (size por defecto 1000)
- POST /comentario
- PUT /comentario
- DELETE /comentario/{id}
- POST /comentario/fill/{cantidad}
- DELETE /comentario/empty
- GET /comentario/count

---

## 14. Comentarios de Artículos
Modelo: `id`, `contenido`, `articulo` (objeto), `usuario` (objeto).

Endpoints:
- GET /comentarioart/{id}
- GET /comentarioart?page&size&sort&contenido&id_articulo&id_usuario (size por defecto 1000)
- POST /comentarioart
- PUT /comentarioart
- DELETE /comentarioart/{id}
- POST /comentarioart/fill/{cantidad}
- DELETE /comentarioart/empty
- GET /comentarioart/count

---

## 15. Puntuaciones
Modelo: `id`, `puntuacion` (1-5), `noticia` (objeto), `usuario` (objeto).

Endpoints:
- GET /puntuacion/{id}
- GET /puntuacion?page&size&sort&id_noticia&id_usuario (size por defecto 1000)
- POST /puntuacion
- PUT /puntuacion
- DELETE /puntuacion/{id}
- POST /puntuacion/fill/{cantidad}
- DELETE /puntuacion/empty
- GET /puntuacion/count

---

## 16. Artículos
Modelo: `id`, `descripcion`, `precio`, `descuento`, `imagen`, `tipoarticulo` (objeto), `club` (objeto), contadores `comentarioarts`, `compras`, `carritos`.

Endpoints:
- GET /articulo/{id}
- GET /articulo?page&size&sort&descripcion&idTipoarticulo&idClub (size por defecto 1000)
- POST /articulo
- PUT /articulo
- DELETE /articulo/{id}
- POST /articulo/fill/{cantidad}
- GET /articulo/fill (crea 50 por defecto)
- DELETE /articulo/empty
- GET /articulo/count

---

## 17. Tipos de Artículo
Modelo: `id`, `descripcion`, `club` (objeto), contador `articulos`.

Endpoints:
- GET /tipoarticulo/{id}
- GET /tipoarticulo?page&size&sort&descripcion&idClub (size por defecto 1000)
- POST /tipoarticulo
- PUT /tipoarticulo
- DELETE /tipoarticulo/{id}
- POST /tipoarticulo/fill/{cantidad}
- DELETE /tipoarticulo/empty
- GET /tipoarticulo/count

---

## 18. Carrito
Modelo: `id`, `cantidad`, `articulo` (objeto), `usuario` (objeto).

Endpoints:
- GET /carrito/{id}
- GET /carrito?page&size&sort&idUsuario&idArticulo (size por defecto 1000)
- POST /carrito
- PUT /carrito
- DELETE /carrito/{id}
- POST /carrito/fill/{cantidad}
- DELETE /carrito/empty
- GET /carrito/count

---

## 19. Facturas
Modelo: `id`, `fecha`, `usuario` (objeto), contador `compras`.

Endpoints:
- GET /factura/{id}
- GET /factura?page&size&sort&idUsuario (size por defecto 1000)
- POST /factura
- PUT /factura
- DELETE /factura/{id}
- POST /factura/fill/{cantidad}
- DELETE /factura/empty
- GET /factura/count

---

## 20. Compras
Modelo: `id`, `cantidad`, `precio`, `articulo` (objeto), `factura` (objeto).

Endpoints:
- GET /compra/{id}
- GET /compra?page&size&sort&id_articulo&id_factura
- POST /compra
- PUT /compra
- DELETE /compra/{id}
- POST /compra/fill/{cantidad}
- DELETE /compra/empty
- GET /compra/count

---

## 21. Cuotas
Modelo: `id`, `descripcion`, `cantidad`, `fecha`, `equipo` (objeto), contador `pagos`.

Endpoints:
- GET /cuota/{id}
- GET /cuota?page&size&sort&descripcion&idEquipo (size por defecto 1000)
- POST /cuota
- PUT /cuota
- DELETE /cuota/{id}
- POST /cuota/fill/{cantidad}
- DELETE /cuota/empty
- GET /cuota/count

---

## 22. Pagos
Modelo: `id`, `cuota` (objeto), `jugador` (objeto), `abonado`, `fecha`.

Endpoints:
- GET /pago/{id}
- GET /pago?page&size&sort&idCuota&idJugador (size por defecto 1000)
- POST /pago
- PUT /pago
- DELETE /pago/{id}
- POST /pago/fill/{cantidad}
- DELETE /pago/empty
- GET /pago/count

---

## Utilidades de datos
- `POST /{recurso}/fill/{cantidad}`: rellena con datos aleatorios (cuando aplica, `GET /articulo/fill` crea 50 por defecto).
- `DELETE /{recurso}/empty`: elimina todos los registros del recurso.
- `GET /{recurso}/count`: devuelve el total de registros.

Esta guía refleja el código actual en `src/main/java/net/ausiasmarch/gesportin/api` y las entidades de `src/main/java/net/ausiasmarch/gesportin/entity` con claves ajenas expandidas y contadores en colecciones.
