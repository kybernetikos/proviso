const wrapperTypes = new Set([Number, Boolean, String, Symbol])

function isType(type) {
	if (wrapperTypes.has(type)) {
		return nameFunction(`is a ${type.name.toLowerCase()}`, (val) => Object(val) instanceof type)
	}
	return nameFunction(`is a ${type.name.toLowerCase()}`, (val) => val instanceof type)
}
exports.isType = isType

function is(expected) {
	return nameFunction(`is ${String(expected)}`, (val) => (expected === 0 && val === 0) || Object.is(val, expected))
}
exports.is = is

function startsWith(prefix) {
	return nameFunction(`starts with '${prefix}'`, (val) => val.substring(0, prefix.length) === prefix)
}
exports.startsWith = startsWith

exports.isEven = nameFunction("is even", (val) => val % 2 === 0)

exports.isEmpty = nameFunction("is empty", (val) => val == null || val.length === 0 || val.size === 0)

function greaterThan(lowVal) {
	return nameFunction(`is greater than ${lowVal}`, (val) => lowVal < val)
}
exports.greaterThan = greaterThan

function lessThan(hiVal) {
	return nameFunction(`is less than ${hiVal}`, (val) => val < hiVal)
}
exports.lessThan = lessThan

function divisibleBy(divisor) {
	return nameFunction(`is divisible by ${divisor}`, (val) => val % divisor === 0)
}
exports.divisibleBy = divisibleBy

function isOneOf(...items) {
	const set = new Set(items)
	return nameFunction(`is one of ('${items.join("', '")}')`, (val) => set.has(val))
}
exports.isOneOf = isOneOf

function regex(re) {
	return nameFunction(`matches regex ${re}`, (val) => val.match(re) !== null)
}
exports.regex = regex

function nameFunction(name, body) {
	Object.defineProperty(body, 'name', {writable: false, enumerable: false, configurable: true, value: name})
	return body
}