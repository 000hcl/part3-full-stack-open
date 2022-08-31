const { response } = require('express')
const express = require('express')
const app = express()
var morgan = require('morgan')



app.use(express.json())

morgan.token('postdata', (request)=>{
  return(
    JSON.stringify(request.body)
  )
})

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
    response.json(persons)
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
  const id = Math.floor(Math.random() * 99999)
  const person = request.body
  person.id = id
  persons = persons.concat(person)

  if (!person.name){
    return response.status(400).json({ 
      error: 'name missing' 
    })
  } else if (!person.number){
    return response.status(400).json({ 
      error: 'number missing' 
    })
  } else if (persons.some(p=>p.name===person.name)){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }else {
    response.json(person)
  }

  
})

app.get('/info', (request, response) => {
    const date = new Date();
    message = `Phonebook has info for ${persons.length} people <br> ${date}`
    response.send(message)
})

const PORT = 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})