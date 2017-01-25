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


function and(...predicates) {
	return new And(predicates)
}
exports.and = and

function or(branches) {
	return new Or(branches)
}
exports.or = or
