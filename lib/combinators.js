const Spec = require('./spec')

class Or extends Spec {
	constructor(registry, branches) {
		super("or(" + Object.entries(branches).map(([key, pred]) => `${key}: ${pred.name}`).join(", ") + ")")
		this.branches = new Map(Object.entries(branches))
		this.registry = registry
	}

	match(value) {
		for (let pred of this.branches.values()) {
			if (this.registry.match(pred, value)) {
				return true
			}
		}
		return false
	}

	conform(value) {
		for (let [key, pred] of this.branches) {
			if (this.registry.match(pred, value)) {
				return {
					[key]: this.registry.conform(pred, value)
				}
			}
		}
		return Spec.Invalid
	}

	explain(value, dataPath, specPath, fullValue, fullSpec) {
		let result = []
		for (let [key, pred] of this.branches) {
			if (this.registry.match(pred, value)) {
				return []
			}
			const others = this.registry.explain(pred, value, dataPath, [...specPath, key], fullValue, fullSpec)
			result.push(...others)
		}
		return result
	}

	toJSON() {
		return {
			spec: 'or',
			branches: Array.from(this.branches.entries())
		}
	}
}

class And extends Spec {
	constructor(registry, predicates) {
		super(predicates.map(p => p.name).join(" and "))
		this.predicates = predicates
		this.registry = registry
	}

	match(value) {
		for (let pred of this.predicates) {
			if (!this.registry.match(pred, value)) {
				return false
			}
		}
		return true
	}

	conform(value) {
		for (let pred of this.predicates) {
			if (!this.registry.match(pred, value)) {
				return Spec.Invalid
			}
		}
		return value
	}

	explain(value, dataPath, specPath, fullValue, fullSpec) {
		let result = []
		for (let pred of this.predicates) {
			const problems = this.registry.explain(pred, value, dataPath, [...specPath, pred.name], fullValue, fullSpec)
			result.push(...problems)
		}
		return result
	}

	toJSON() {
		return {
			spec: 'and',
			predicates: this.predicates
		}
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
		super(undefined)
		this.registry = registry
	}

	get name() {
		return `values meet spec defined by {${Array.from(this.registry.namedSpecs.entries()).map(([name, spec]) => name+": " + spec.name).join(". ")}}`
	}

	match(value) {
		if (isMaplike(value)) {
			const entries = value.entries ? value.entries() : Object.entries(value)
			for (let [key, value] of entries) {
				if (this.registry.namedSpecs.has(key)) {
					if (!this.registry.match(key, value)) {
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

	explain(value, dataPath = [], specPath = [] , fullValue = value, fullSpec = this) {
		const result = []

		if (isMaplike(value)) {
			const entries = value.entries ? value.entries() : Object.entries(value)
			for (let [key, value] of entries) {
				if (this.registry.namedSpecs.has(key)) {
					const problems = this.registry.explain(key, value, [...dataPath, key], [...specPath, key], fullValue, fullSpec)
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

	toString() {
		return this.name
	}
}

exports.ValuesMeetSpec = ValuesMeetSpec
exports.And = And
exports.Or = Or