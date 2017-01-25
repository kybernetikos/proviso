const Spec = require('./spec')
const Problem = require('./problem')

function match(spec, value) {
	if (spec instanceof Spec) {
		return spec.match(value)
	}
	try {
		return spec(value)
	} catch (e) {
		console.error(e)
	}
	return false
}
exports.match = match

function conform(spec, value) {
	if (spec instanceof Spec) {
		return spec.conform(value)
	}
	return match(spec, value) ? value : Spec.Invalid
}
exports.conform = conform

function explain(spec, value) {
	return _explain(spec, value, [], [], value, spec)
}
exports.explain = explain

function _explain(spec, value, dataPath, specPath, fullValue, fullSpec) {
	if (spec instanceof Spec) {
		return spec.explain(value, dataPath, specPath, fullValue, fullSpec)
	}
	return match(spec, value) ? [] : [ new Problem(value, dataPath, spec, specPath, fullValue, fullSpec) ]
}
exports._explain = _explain