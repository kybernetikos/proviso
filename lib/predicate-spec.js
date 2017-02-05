const Problem = require('./problem')
const Spec = require('./spec')

class PredicateSpec extends Spec {
	constructor(predicate, name) {
		if (typeof predicate !== "function") {
			throw new TypeError("Predicate must be a function, was " + typeof predicate)
		}
		super(name || predicate.name)
		this.predicate = predicate
	}

	match(value) {
		return Boolean(this.predicate(value))
	}

	explain(value, dataPath, specPath, fullValue, fullSpec) {
		return this.match(value) ? [] : [ new Problem(value, dataPath, this, specPath, fullValue, fullSpec) ]
	}
}

module.exports = PredicateSpec