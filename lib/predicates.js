const wrapperTypes = new Set([Number, Boolean, String, Symbol])

function isType(type) {
	if (wrapperTypes.has(type)) {
		return nameFunction(`is a ${type.name.toLowerCase()}`, (val) => Object(val) instanceof type, () => ({fn: 'isType', type: type.name}))
	}
	return nameFunction(`is a ${type.name.toLowerCase()}`, (val) => val instanceof type, () => ({fn: 'isType', type: type.name}))
}
exports.isType = isType

function is(expected) {
	return nameFunction(`is ${String(expected)}`, (val) => (expected === 0 && val === 0) || Object.is(val, expected), () => ({fn: 'is', value: expected}))
}
exports.is = is

function startsWith(prefix) {
	return nameFunction(`starts with '${prefix}'`, (val) => val.substring(0, prefix.length) === prefix, () => ({fn: 'string:startsWith', prefix}))
}
exports.startsWith = startsWith

exports.isEven = nameFunction("is even", (val) => val % 2 === 0, () => ({fn: 'isEven'}))

exports.isEmpty = nameFunction("is empty", (val) => val == null || val.length === 0 || val.size === 0, () => ({fn: 'isEmpty'}))

function greaterThan(lowVal) {
	return nameFunction(`is greater than ${lowVal}`, (val) => lowVal < val, () => ({fn: 'greaterThan', value: lowVal}))
}
exports.greaterThan = greaterThan

function lessThan(hiVal) {
	return nameFunction(`is less than ${hiVal}`, (val) => val < hiVal, () => ({fn: 'lessThan', value: hiVal}))
}
exports.lessThan = lessThan

function divisibleBy(divisor) {
	return nameFunction(`is divisible by ${divisor}`, (val) => val % divisor === 0, () => ({fn: 'divisibleBy', value: divisor}))
}
exports.divisibleBy = divisibleBy

function isOneOf(...items) {
	const set = new Set(items)
	return nameFunction(`is one of ('${items.join("', '")}')`, (val) => set.has(val), () => ({fn: 'isOneOf', value: items}))
}
exports.isOneOf = isOneOf

function regex(re) {
	return nameFunction(`matches regex ${re}`, (val) => val.match(re) !== null, () => ({fn: 'string:regex', regex: re.source, flags: re.flags}))
}
exports.regex = regex

function hasKey(keyName) {
	return nameFunction(`has key ${keyName}`, (val) => val instanceof Map ? val.has(keyName) : keyName in val, () => ({fn: 'hasKey', value: keyName}))
}
exports.hasKey = hasKey

function nameFunction(name, body, toJSON) {
	Object.defineProperty(body, 'name', {writable: false, enumerable: false, configurable: true, value: name})
	if (toJSON) {
		Object.defineProperty(body, 'toJSON', {writable: false, enumerable: false, configurable: true, value: toJSON})
	}
	return body
}