// File: src/app.js
const express = require('express');
const cors = require('cors');
const { successResponse } = require('./utils/response');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

// CHỈ import thư mục routes (Node sẽ tự động tìm file index.js bên trong)
const apiRoutes = require('./routes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  successResponse(res, "Server is running", null, 200);
});

// Tiền tố /api sẽ được cộng với mọi thứ trong routes/index.js
app.use('/api', apiRoutes); 

app.use(notFound);
app.use(errorHandler);

module.exports = app;