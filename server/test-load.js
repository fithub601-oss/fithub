require('./dns-patch');
console.log('dns-patch loaded');
require('dotenv').config();
console.log('dotenv loaded');
const express = require('express');
console.log('express loaded');
const mongoose = require('mongoose');
console.log('mongoose loaded');
console.log('all modules load ok');
