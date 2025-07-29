const z = require('zod')

const movieSchema = z.object({
        title: z.string({
            invalid_type_error: 'Title must be a string',
            required_error: 'Title is required'
        }),
        year: z.number().int().min(1900).max(2024),
        director: z.string().min(1),
        duration: z.number().int().positive(),
        poster: z.string().url(),
        rate: z.number().min(0).max(10).optional(),
        genre: z.array(
            z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']),
            {
                required_error: 'Genre is required',
                invalid_type_error: 'Genre must be an array of strings'
            }
        )
    })

function validateMovie (object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie 
}