const util = require('util')

class Problem {
	constructor(value, dataPath, spec, specPath, fullValue, fullSpec) {
		Object.assign(this, {value, dataPath, spec, specPath, fullValue, fullSpec})
	}

	toString() {
		const dataPosition = this.dataPath.length === 0 ? "" : `at ${this.dataPath.join(".")} of '${util.inspect(this.fullValue)}' `
		const specPosition = this.specPath.length === 0 ? "" : ` at [${this.specPath.join("].[")}] of '${this.fullSpec}'`
		return `Value '${util.inspect(this.value)}' ${dataPosition}failed check '${getName(this.spec)}'${specPosition}`
	}
}
module.exports = Problem

function getName(spec) {
	return spec.name || "[Anonymous Spec]"
}
