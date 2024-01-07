const express = require('express');
const router = express.Router();
const {loginFunction,loginPostFunction} = require('../controllers/login');
const jwtVerify = require('../utils/jwtVerify');

router.get('/',jwtVerify,loginFunction);
router.post('/',loginPostFunction);

module.exports = router;