"use strict";
var ejs = require('ejs');
var fs = require('fs');
var template = fs.readFileSync('./templates/equation.tex.ejs', 'utf-8');
var tmp = require('tmp');
var path = require('path')
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;


var latex_to_png = {

	render: function(formula,size){
    	var density = parseInt((300/10)*size)

		var rendered_formula = ejs.render(template, { formula: formula })
		var tmp_file = tmp.fileSync();

		fs.writeFileSync(tmp_file.name, rendered_formula);

		var dirname = path.dirname(tmp_file.name)
		var basename = path.basename(tmp_file.name)
		var name = basename.replace(/\..*$/g,"")

		var cmd = 'cd ' +dirname+ '; latex -halt-on-error ' + name +'.tmp && '+
				'dvips -q* -E ' + name + '.dvi  && ' +
				'convert -density '+ density + 'x'+density + ' ' + name + '.ps '  + name + '.png' 


		const rm_cmd =	'cd ' +dirname+ '; rm -f ' + name + '.dvi ' + name + '.log ' + name + '.aux ' + name + '.ps ';

		const child = execSync(cmd);

		exec(rm_cmd)


	    try{
	      return fs.readFileSync("/tmp/"+name + ".png");
	    }catch(err){
	    	console.dir(err)
	    }	


	}
}
var content = latex_to_png.render('a*b', 5)

// var content = latex_to_png.render('\\cancel{a}*b', "test.png",5)
console.log(content)
module.exports = latex_to_png