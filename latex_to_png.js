"use strict";
var ejs = require('ejs');
var fs = require('fs');
var template = fs.readFileSync('./templates/equation.tex.ejs', 'utf-8');
var execSync = require('exec-sync');
var tmp = require('tmp');
var path = require('path')

function puts(error, stdout, stderr) { 
	sys.puts("error: " + error)
	sys.puts("stderr: " +stderr)
	sys.puts("stdout: " +stdout)
}

var latex_to_png = {

	render: function(formula,filename,size){
    var density = parseInt((300/10)*size)

		var rendered_formula = ejs.render(template, { formula: formula })
		var tmp_file = tmp.fileSync();

		fs.writeFileSync(tmp_file.name, rendered_formula);

		var dirname = path.dirname(tmp_file.name)
		var basename = path.basename(tmp_file.name)
		var name = basename.replace(/\..*$/g,"")

		//	console.log(name)

		// console.log(rendered_formula)
		//	console.log(dirname)
				var test = `test `
				console.log(test)
		execSync('latex -halt-on-error ' + tmp_file.name + ' >> '+ dirname + '/convert_'+name+'.log');
		execSync('dvips -q* -E ' + name + '.dvi  >> convert_'+ name + '.log');
		execSync('convert -density '+ density + 'x'+density + ' ' + name + '.ps '+ filename+'  >> convert_' +name + '.log');
		execSync('rm -f ' + name + '.dvi ' + name + '.log ' + name + '.aux ' + name + '.ps');

    if(fs.existsSync(filename)){
      execSync('rm -f convert_' + name + '.log')
      return fs.readFileSync(filename);

    }else{
      execSync('cp '+ tmp_file.name + ' '+ dirname +'/origin_' + name + '.log')
      throw Error("latex to png fail")
    }


	}
}

var content = latex_to_png.render("a*b", "test.png",5)
console.log(content)
module.exports = latex_to_png