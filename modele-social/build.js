/* eslint-env node */
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

// utf8 url
const publicodesDir = decodeURI(new URL('./règles', import.meta.url).pathname)
const outDir = new URL('./dist', import.meta.url).pathname

if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir)
}

function concatenateFilesInDir(dirPath = publicodesDir) {
	return fs
		.readdirSync(dirPath)
		.map((filename) => {
			const fullpath = path.join(dirPath, filename)
			if (fs.statSync(fullpath).isDirectory()) {
				return concatenateFilesInDir(fullpath)
			} else {
				return filename.endsWith('.yaml') ? fs.readFileSync(fullpath) : ''
			}
		})
		.reduce((acc, cur) => acc + '\n' + cur, '')
}

function readRules() {
	return yaml.parse(concatenateFilesInDir())
}

// Note: we can't put the output file in the fs.watched directory

function writeJSFile() {
	const rules = readRules()
	const names = Object.keys(rules)
	const jsString = `export default ${JSON.stringify(rules, null, 2)}`
	fs.writeFileSync(path.resolve(outDir, 'index.js'), jsString)
	fs.writeFileSync(
		path.resolve(outDir, 'names.ts'),
		`\nexport type Names = ${names.map((name) => `"${name}"`).join('\n  | ')}\n`
	)
}

writeJSFile()
export function watchDottedNames() {
	return fs.watch(publicodesDir, writeJSFile)
}
