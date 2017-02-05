const {explain, conform, match} = require('./operations')
const Spec = require('./spec')
const {is, isType, isEven, startsWith, isEmpty, lessThan, greaterThan, isOneOf, regex, hasKey} = require('./predicates')
const {or, and, valuesMeetSpec} = require('./combinators')
const util = require('util')

const isUsername = and(isType(String), startsWith("user-"))
const userNameOrId = or({username: isUsername, id: isType(Number)})

function explainStr(spec, value) {
	const result = explain(spec, value)
	if (result.length === 0) {
		return `Value ${util.inspect(value)} fulfills spec ${spec.name}`
	}
	return result.join('\n\tand\n')
}

console.log(explainStr(userNameOrId, "bob"))
console.log(explainStr(isOneOf(90, 91, 92, 93, 94), 95))
console.log(explainStr(regex(/^[abc]+$/), 'aaabd'))
console.log(explainStr(hasKey('bob'), {jim: 22}))

console.log(explainStr(and(hasKey('jim'), valuesMeetSpec({
	jim: and(isType(Number), greaterThan(10))
})), {jim: 11, other: [{}, {stuff: {jim: 8}}]}))