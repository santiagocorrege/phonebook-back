const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('type', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan((function (tokens, req, res) {
    
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.type(req, res)
    ].join(' ')
  }),'combined'))

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown endpoint'})
}


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

app.get('/', (req, res) => {
    res.send('<h1>Welcome</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    const datetime = new Date();
    res.send(`Phonebook has info for ${persons.length} people <br/><h2>${datetime}</h2>`)
})

const userExist = (id) => {
    return persons.map(e => e.id).includes(id)
} 

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    if(userExist(id)){
        res.json(persons[id])
    } else {
        res.status(404).end()
    }
    res.end()
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    if(userExist(id)){
        persons = persons.filter(e => e.id !== id)
        console.log(id);
        console.log(persons);
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})

const getId = () => {
    return Math.floor(Math.random()*100)
}

const isUserRegistered = username => persons.map(e => e.name).includes(username)

app.post('/api/persons', (req, res) => {
    const {name, number } = req.body 
    if(!name || !number){
        return res.status(204).json({ error: 'PONE BIEN LOS DATOS PELOTUDO' })
    } else if (isUserRegistered(name)){
        return res.status(409).json({ error: 'YA TA REGISTRADO JO PUTA' }) 
    }
    const person = {
        id: getId(),
        name,
        number,
    }
    persons = persons.concat(person)
    res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
    const { id } = Number(req.params.id)
    if(persons.map(e => e.id).includes(id)){
        persons = persons.filter(e => e.id !== id)
        console.log(persons, id);
        return res.status(201).json({ message: `completed ${persons.filter(e=> e.id)}`})
    } else {
        return res.status(404).json({ message: "not found user"})
    }
})

app.put('/api/persons/:id', (req, res) => {
    const person = req.body
    persons = persons.map(e => e.name !== person.name ? e : person)
    console.log(persons);
    res.json(person)
})

app.use(unknownEndpoint)



const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log('Server phone-back running in port ',PORT);
})