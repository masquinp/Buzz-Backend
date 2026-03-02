var express = require('express');
var router = express.Router();

const Booking = require('../models/bookings');
const User = require('../models/users');
const Ride = require('../models/rides');

router.get('/', (req, res) => {
Booking.find().populate( 'users', 'rides')  
.then(data => { 
    res.json({ result: true, bookings : data }); 
}); 
});





module.exports = router;