const Engine = require('publicodes')
const { performance } = require('perf_hooks')
const { readRules } = require('../../mon-entreprise/scripts/rules')
const rules = readRules()

const engine = new Engine.default(rules)

function run() {
	engine.setSituation({
		'contrat salarié . rémunération . brut de base': 3000
	})
	engine.evaluate('contrat salarié . rémunération . net')
}

const res = []

Array.from(Array(100)).forEach(function() {
	const t0 = performance.now()
	Array.from(Array(10)).forEach(run)
	const t1 = performance.now()
	res.push(t1 - t0)
})

// utils - https://stackoverflow.com/a/55297611/1652064
const asc = arr => arr.sort((a, b) => a - b)

const sum = arr => arr.reduce((a, b) => a + b, 0)

const mean = arr => sum(arr) / arr.length

// sample standard deviation
const std = arr => {
	const mu = mean(arr)
	const diffArr = arr.map(a => (a - mu) ** 2)
	return Math.sqrt(sum(diffArr) / (arr.length - 1))
}

const quantile = (arr, q) => {
	const sorted = asc(arr)
	const pos = (sorted.length - 1) * q
	const base = Math.floor(pos)
	const rest = pos - base
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base])
	} else {
		return sorted[base]
	}
}

// res

console.log('std:', std(res))
console.log('0.10:', quantile(res, 0.1))
console.log('0.25:', quantile(res, 0.25))
console.log('median:', quantile(res, 0.5))
console.log('mean:', mean(res))
console.log('0.75:', quantile(res, 0.75))
console.log('0.90:', quantile(res, 0.9))
