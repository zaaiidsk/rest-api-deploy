const express = require('express')
const crypto = require('crypto')
const movies = require('./movies.json')
const z = require('zod')
const {validateMovie, validatePartialMovie} = require('./schemas/movies.js')

const app = express()
app.disable('x-powered-by')
app.use(express.json()) // Middleware para parsear JSON automáticamente

const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://movies.com'] // Lista de orígenes permitidos para CORS

app.get('/', (req, res) => {
    // Leer el query param de format
    res.json({message: 'Hello World!'})
})


// Todos los recursos que sean MOVIES se identifican con la URL /movies
app.get('/movies', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin) // Permitir CORS
    }

    const {genre} = req.query // Extraer el género de los query parameters
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.includes(genre)
        )
        return res.json(filteredMovies)
    }
    res.json(movies) // Si no hay género, devolver todas las películas
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
     const { id } = req.params // Extraer el id de la URL
     const movie = movies.find(movie =>  movie.id === id)
     if (movie) return res.json(movie)
     res.status(404).send('Movie not found')
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if (!result.success) {
        return res.status(400).json({error: result.error.issues})
    }

    const newMovie = {
        id: crypto.randomUUID(), // Generar un ID único
        ...result.data, // Usar los datos validados
    }
    // Esto no sería REST, porque estamos guardando el estado en memoria
    movies.push(newMovie)
    res.status(201).json(newMovie) // Devolver el nuevo recurso creado
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({error: result.error.issues})
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) {
        return res.status(404).send('Movie not found')
    }

    const updateMovie = {
        ...movies[movieIndex], // Mantener los datos existentes
        ...result.data, // Actualizar con los datos validados
    }

    movies[movieIndex] = updateMovie // Actualizar la película en el array

    return res.json(updateMovie) // Devolver la película actualizada
})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin) // Permitir CORS
    }
    
    const {id} = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1) // Eliminar la película del array
    return res.json({message: 'Movie deleted successfully'})
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin) // Permitir CORS
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS') // Métodos permitidos
    }
    res.sendStatus(200)
})

const PORT = process.env.PORT ?? 4000

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
