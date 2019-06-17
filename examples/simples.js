const latexToPng = require("../")


latexToPng.render("a + b", 4).then(data => console.log(data)).catch(err => console.error(err))