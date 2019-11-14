const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const Users = require('./users-model');
const restricted = require('./restricted-middleware')

const server = express();

server.use(express.json());

server.post('/api/register', (req, res) => {
    let user = req.body

    const hash = bcrypt.hashSync(user.password, 12)

    user.password = hash

    Users.add(user)
        .then(uInfo => {
            res.status(201).json({ message: "successfully registered" })
        })
        .catch(error => {
            res.status(500).json({ message: "error when registering" })
        })
})

server.post('/api/login', (req, res) => {
    let { username, password } = req.body

    Users.findBy({ username })
        .first()
        .then(user => {
            console.log(user)
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = getJwtToken(user.username, user.password, user.department)

                res.status(200).json({ token, message: `Welcome ${user.username}` })
            } else {
                res.status(401).json({ message: 'Invalid Credentials' });
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json(error);
        });
})

server.get('/api/users', restricted, checkRole('student'), (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});

function getJwtToken(username, password, department) {
    const payload = {
        username,
        password,
        department
    }

    const secret = process.env.JWT_SECRET || 'is it secret, is it safe?'

    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, secret, options)
}

function checkRole(role) {
    return function (req, res, next) {
        if (role === req.decodedToken.department) {
            next()
        } else {
            res.status(403).json({ message: 'You aren\'t allowed' })
        }
    }
}

module.exports = server;