"use strict";

const ejs = require('ejs');
const fs = require('fs');
const template = fs.readFileSync(__dirname + '/templates/equation.tex.ejs', 'utf-8');
const tmp = require('tmp');
const path = require('path')
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;


module.exports = {

	_generateLatexFile(formula) {
		const latex = ejs.render(template, { formula })
		
		return new Promise((result, reject) => {
			tmp.file({}, (err, filename) => {
				if (err) {

					reject(err)

				} else {

					fs.writeFile(filename, latex, writeErr => 
						writeErr ? reject(writeErr) : result(filename)
					)
				}
			})
		})
	},

	_revoveIntermediateFiles(dirname, name) {
		const rmCmd =	[
			`cd ${dirname}`,
		  `rm -f ${name}.dvi ${name}.log  ${name}.aux ${name}.ps`,
		].join(" && ")

		return new Promise((resolve, reject) =>
			exec(rmCmd, (err, stdOut, stdErr) =>
				err ? reject(err) : resolve(stdOut)
			)
		)
	},

	_readImage(name) {

		return new Promise((resolve, reject) =>

			fs.readFile(`/tmp/${name}.png`, (err, data) =>
				err ? reject(err) : resolve(data)
			)
		)
	},

	_buildImageFile(tmpFilename, size) {

		const dirname = path.dirname(tmpFilename)
		const basename = path.basename(tmpFilename)
		const name = basename.replace(/\..*$/g, "")

		const density = parseInt(300 / 10 * size)
		
		const cmd = [
			`cd ${dirname}`,
			`latex -halt-on-error ${name}.tmp`,
			`dvips -q* -E ${name}.dvi` ,
			`convert -density ${density}x${density} ${name}.ps ${name}.png`,
		].join(" && ")
		

		return new Promise((resolve, reject) => {

			exec(cmd, (err, stdOut, stdErr) => {
				/**
				 * TODO: schedule this to match in future
				 */
				this._revoveIntermediateFiles(dirname, name)

				err ? reject(err) : resolve(stdOut)
			})
		}).then(() => 
			this._readImage(name)
		)
	},

	render(formula, size) {

		return this._generateLatexFile(formula).then(filename =>
			this._buildImageFile(filename, size)
		)
	}
}