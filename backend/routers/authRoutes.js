const express = require('express');
const { Register } = require('../controller/authRegister')
const router = express();

router.post('/register', Register);

exports.module = router;

