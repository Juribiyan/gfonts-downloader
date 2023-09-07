import fetch from 'node-fetch'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv
import {createWriteStream} from 'fs'
import {access, mkdir, writeFile} from 'fs/promises'

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"

async function processCSS(css) {
	let urls = {}, fontName = ''
	let matches = css.matchAll(/\/\* (.+?) \*\/\s+@font-face\s+\{[\s\S]+?font-family\:\s+'(.+?)';[\s\S]+?font-style\:\s+(.+?);[\s\S]+?font-weight\:\s+(.+?);[\s\S]+?url\((.+?)\)[\s\S]+?unicode-range\:\s+(.+?);[\s\S]+?\}/g)
	for (let m of matches) {
		let [charset, family, style, weight, url, unicodeRange] = m.slice(1)
		if (! fontName)
			fontName = family
		let id = `${charset}.${style}.${weight}`
		if (! urls.hasOwnProperty(url)) {
			urls[url] = [id]
		}
		else {
			urls[url].push(id)
		}
	}
	for (let u in urls) {
		let fileName = `${fontName.replace(/ /g,'')}_${urls[u].join(',')}.woff2`
		css = css.replaceAll(u, fileName)
		await downloadFile(u, `output/${fileName}`)
	}
	await writeFile(`output/${fontName}.css`, css)
}

async function downloadFile(srcURL, destURL) {
	const response = await fetch(srcURL)
	const arrayBuffer = await response.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	createWriteStream(destURL).write(buffer)
}

(async () => {
	const resp = await fetch(argv.url, {headers: {"User-Agent": userAgent}})
	const css = await resp.text()
	try {
		await access('output')
	}
	catch(e) {
		console.log('Creating output directory...')
		await mkdir('output')
	}
	await processCSS(css)
})()
