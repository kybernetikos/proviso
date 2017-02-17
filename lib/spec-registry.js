const Spec = require('./spec')
const PredicateSpec = require('./predicate-spec')
const {Or, And, ValuesMeetSpec} = require('./combinators')
const util = require('util')

class SpecRegistry {
	constructor(initialSpecs) {
		const initial = initialSpecs ? Array.from(initialSpecs).map(([key, spec]) => [key, this.asSpec(spec)]) : []
		this.namedSpecs = new Map(initial)
		this.checkValues = new ValuesMeetSpec(this)
		this.shouldCheckValues = false

		Object.assign(this, {
			define: this.define.bind(this), match: this.match.bind(this),
			conform: this.conform.bind(this), explain: this.explain.bind(this),
			explainStr: this.explainStr.bind(this), and: this.and.bind(this),
			or: this.or.bind(this)
		})
	}

	asSpec(spec) {
		if (spec instanceof Spec) {
			return spec
		} else if (typeof spec === "function") {
			return new PredicateSpec(spec)
		} else if (typeof spec === "string" && this.namedSpecs.has(spec)) {
			return this.namedSpecs.get(spec)
		}
		throw new Error("Unable to initialise the spec " + util.inspect(spec))
	}

	define(name, spec) {
		this.namedSpecs.set(name, this.asSpec(spec))
		this.shouldCheckValues = true
	}

	match(spec, value) {
		if (this.shouldCheckValues && !this.checkValues.match(value)) {
			return false
		}
		return this.asSpec(spec).match(value)
	}

	conform(spec, value) {
		if (this.shouldCheckValues && this.checkValues.conform(value) === Spec.Invalid) {
			return Spec.Invalid
		}
		return this.asSpec(spec).conform(value)
	}

	explain(spec, value, dataPath = [], specPath = [], fullValue = value, fullSpec = undefined) {
		const specObj = this.asSpec(spec)
		if (fullSpec !== undefined) {
			fullSpec = this.asSpec(fullSpec)
		}
		const problems = specObj.explain(value, dataPath, specPath, fullValue, fullSpec || specObj)
		if (this.shouldCheckValues) {
			problems.push(...this.checkValues.explain(value))
		}
		return problems
	}

	explainStr(spec, value) {
		const result = this.explain(spec, value)
		if (result.length === 0) {
			return `Value ${util.inspect(value)} fulfills spec ${spec.name}`
		}
		return result.join('\n\tand\n')
	}

	or(branches) {
		return new Or(this, branches)
	}

	and(...predicates) {
		return new And(this, predicates)
	}

	toJSON() {
		return Array.from(this.namedSpecs.entries()).reduce((acc, [key, spec]) => {
			console.log('key', key)
			acc[key] = spec
			return acc
		}, {})
	}
}

module.exports = SpecRegistry