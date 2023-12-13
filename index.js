const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const connectDatabase = async () => {
    try {
      await mongoose.connect(process.env.DEFAULT_CONNECTION);
  
      console.log("connected to database");
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  connectDatabase();

const app = express();

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('static'))
app.use('/', routes);
app.use(cookieParser());

const port = process.env.PORT || 80;

app.listen(port, () => console.log(`Server running at port ${port}...`));

module.exports = app;