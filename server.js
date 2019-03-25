const express = require('express');
const app = express();
const server = app.listen(3000, listening);

function listening() {
  console.log('Servidor encendido');
}

app.use(express.static('./'));