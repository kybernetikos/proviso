class Spec {
	constructor(name) {
		this.name = name
	}
	match(value) {
		return true
	}
	conform(value) {
		return value
	}
	explain(value) {
		return []
	}
	toString() {
		return this.name
	}
}

Spec.Invalid = {toString()  {return "#Invalid"}}

module.exports = Spec
