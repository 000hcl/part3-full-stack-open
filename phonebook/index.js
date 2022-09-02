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


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response)=>{
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) =>{
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

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
  }

  
})

app.get('/info', (request, response) => {
    const date = new Date();
    message = `Phonebook has info for ${persons.length} people <br> ${date}`
    response.send(message)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})