const Spec = require('./spec')
const {is, isType, isEven, startsWith, isEmpty, lessThan, greaterThan, isOneOf, regex, hasKey} = require('./predicates')
const util = require('util')

const Registry = require('./spec-registry')
const registry = new Registry()
const {explain, explainStr, conform, match, and, or, checkValues} = registry

const isUsername = and(isType(String), startsWith("user-"))
const userNameOrId = or({username: isUsername, id: isType(Number)})

registry.define("jim", and(isType(Number), greaterThan(10)))

console.log(explainStr(userNameOrId, "bob"))
console.log(explainStr(isOneOf(90, 91, 92, 93, 94), 95))
console.log(explainStr(regex(/^[abc]+$/), 'aaabd'))
console.log(explainStr(hasKey('bob'), {jim: 22}))
console.log(explainStr(hasKey('jim'), {jim: 11, other: [{}, {stuff: {jim: 8}}]}))

console.log(JSON.stringify(registry))