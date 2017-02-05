class Spec {
	constructor(name) {
		if (name !== undefined) {
			this.name = name
		}
	}
	match(value) {
		return true
	}
	conform(value) {
		return this.match(value) ? value : Spec.Invalid
	}
	explain(value, dataPath, specPath, fullValue, fullSpec) {
		return []
	}
	toString() {
		return this.name
	}
}

Spec.Invalid = {toString()  {return "#Invalid"}}

module.exports = Spec