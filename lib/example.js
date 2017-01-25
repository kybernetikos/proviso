const {explain, conform, match} = require('./operations')
const Spec = require('./spec')
const {is, isType, startsWith} = require('./predicates')
const {or, and} = require('./combinators')

const isUsername = and(isType(String), startsWith("user-"))
const userNameOrId = or({username: isUsername, id: isType(Number)})

console.log(explain(userNameOrId, "bob").join('\nand\n'))
