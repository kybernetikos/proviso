const {_explain, conform, match} = require('./operations')
const Spec = require('./spec')

class Or extends Spec {
	constructor(branches) {
		super("or(" + Object.entries(branches).map(([key, pred]) => `${key}: ${pred.name}`).join(", ") + ")")
		this.branches = new Map(Object.entries(branches))
	}

	match(value) {
		for (let pred of this.branches.values()) {
			if (match(pred, value)) {
				return true
			}
		}
		return false
	}

	conform(value) {
		for (let [key, pred] of this.branches) {
			if (match(pred, value)) {
				return {
					[key]: conform(pred, value)
				}
			}
		}
		return Spec.Invalid
	}

	explain(value, dataPath, specPath, fullValue, fullSpec) {
		let result = []
		for (let [key, pred] of this.branches) {
			if (match(pred, value)) {
				return []
			}
			const others = _explain(pred, value, dataPath, [...specPath, key], fullValue, fullSpec)
			result.push(...others)
		}
		return result
	}
}

class And extends Spec {
	constructor(predicates) {
		super(predicates.map(p => p.name).join(" and "))
		this.predicates = predicates
	}

	match(value) {
		for (let pred of this.predicates) {
			if (!match(pred, value)) {
				return false
			}
		}
		return true
	}

	conform(value) {
		for (let pred of this.predicates) {
			if (!match(pred, value)) {
				return Spec.Invalid
			}
		}
		return value
	}

	explain(value, dataPath, specPath, fullValue, fullSpec) {
		let result = []
		for (let pred of this.predicates) {
			const problems = _explain(pred, value, dataPath, [...specPath, pred.name], fullValue, fullSpec)
			result.push(...problems)
		}
		return result
	}
}

function keyIn(key, value) {
	if (value instanceof Map) {
		return value.has(key)
	}
	return key in value
}

function isMaplike(value) {
	return value instanceof Map || value.constructor === Object
}

class ValuesMeetSpec extends Spec {
	constructor(registry) {
		super(`map values meet spec defined by {${Object.entries(registry).map(([name, spec]) => name+": " + spec.name).join(". ")}}`)
		this.registry = new Map(Object.entries(registry))
	}

	match(value) {
		if (isMaplike(value)) {
			const entries = value.entries ? value.entries() : Object.entries(value)
			for (let [key, value] of entries) {
				if (this.registry.has(key)) {
					if (!match(this.registry.get(key), value)) {
						return false
					}
				}
				if (!this.match(value)) {
					return false
				}
			}
		} else if (Array.isArray(value) || value instanceof Set) {
			for (let v of value) {
				if (!this.match(v)) {
					return false
				}
			}
		}
		return true
	}

	conform(value) {
		if (this.match(value)) {
			return value
		}
		return Spec.Invalid
	}

	explain(value, dataPath, specPath, fullValue, fullSpec) {
		const result = []

		if (isMaplike(value)) {
			const entries = value.entries ? value.entries() : Object.entries(value)
			for (let [key, value] of entries) {
				if (this.registry.has(key)) {
					const spec = this.registry.get(key)
					const problems = _explain(spec, value, [...dataPath, key], [...specPath, key], fullValue, fullSpec)
					result.push(...problems)
				}
				const childProblems = this.explain(value, [...dataPath, key], specPath, fullValue, fullSpec)
				result.push(...childProblems)
			}
		} else if (Array.isArray(value) || value instanceof Set) {
			let idx = 0
			for (let v of value) {
				const childProblems = this.explain(v, [...dataPath, idx++], specPath, fullValue, fullSpec)
				result.push(...childProblems)
			}
		}
		return result
	}
}

function valuesMeetSpec(registry) {
	return new ValuesMeetSpec(registry)
}
exports.valuesMeetSpec = valuesMeetSpec

function and(...predicates) {
	return new And(predicates)
}
exports.and = and

function or(branches) {
	return new Or(branches)
}
exports.or = or
