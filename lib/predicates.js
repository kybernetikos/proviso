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

function nameFunction(name, body) {
	Object.defineProperty(body, 'name', {writable: false, enumerable: false, configurable: true, value: name})
	return body
}