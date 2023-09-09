import fetch from 'node-fetch'
import {createWriteStream} from 'fs'
import {access, mkdir, readFile, writeFile} from 'fs/promises'

const args = process.argv.slice(2)
let arg = args?.[0]
if (!arg) {
	console.error('Please provide a link to CSS or a text file')
	process.exit(1)
}

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
	let urls = []
	if (arg.indexOf('https://') == 0) {
		urls = [arg]
	}
	else {
		let list = await readFile(arg, 'utf8')
		urls = list.split('\n')
	}

	try {
		await access('output')
	}
	catch(e) {
		console.log('Creating output directory...')
		await mkdir('output')
	}

	for (let url of urls) {
		if (url.indexOf('https://fonts.googleapis.com') != 0) {
			console.error(`Invalid URL:`, url)
			continue;
		}

		console.log('Processing: ', url)

		const resp = await fetch(url, {headers: {"User-Agent": userAgent}})
		if (resp.status != 200) {
			console.error('Failed to fetch!')
			continue;
		}
		const css = await resp.text()
		
		await processCSS(css)
	}	
})()
