const { response } = require('express')
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')
app.use(express.json())

morgan.token('postdata', (request)=>{
  return(
    JSON.stringify(request.body)
  )
})



app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))






app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next)=>{
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)

    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
  
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) =>{
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  Person.findOne({ name: body.name})
  .then(p => {
    if (p) {
      return response.status(400).json({
        error: 'person is already in phonebook'
      })
    } else {
      if (!person.name){
        return response.status(400).json({ 
          error: 'name missing' 
        })
      } else if (!person.number){
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }else {
        person.save().then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
      }
    }
  })
  



})

app.get('/info', (request, response) => {
    const date = new Date();
    const persons = Person.find().count((err, count)=> {
      if (err) {
        console.log(err);
      } else {
        const persons = count
        message = `Phonebook has info for ${persons} people <br> ${date}`
        response.send(message)
      }
      
    })
    
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)
