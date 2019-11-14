const db = require('./data/db-config')

module.exports = {
    add,
    findBy,
    find
}

function add(body) {
    return db('users').insert(body)
}

function find() {
    return db('users')
}

function findBy(filter) {
    return db('users').where(filter);
}
