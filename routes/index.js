

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Property = require('../models/property');
const User = require('../models/users');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login.html');
}

// Home route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Upload property route
router.get('/upload', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/upload.html'));
});

router.post('/upload', isAuthenticated, upload.single('image'), async (req, res) => {
    const newProperty = new Property({
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        localGovernment: req.body.localGovernment,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    await newProperty.save();
    res.redirect('/');
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

// Get property details route
router.get('/property/:id', async (req, res) => {
    const property = await Property.findById(req.params.id);
    res.json(property);
});

// Get properties route with optional filtering
router.get('/properties', async (req, res) => {
    const { localGovernment } = req.query;
    let filter = {};
    if (localGovernment) {
        filter.localGovernment = localGovernment;
    }
    const properties = await Property.find(filter);
    res.json(properties);
});

router.get('/properties', async (req, res) => {
    try {
        const properties = await Property.find();
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Edit property route
router.put('/property/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    const updatedData = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        localGovernment: req.body.localGovernment,
        email: req.body.email,
        phone: req.body.phone,
    };
    
    // If a new image is uploaded, include it in the update
    if (req.file) {
        updatedData.image = req.file.filename;
    }

    try {
        const property = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (property) {
            res.status(200).json(property);
        } else {
            res.status(404).send('Property not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating property');
    }
});

// Delete property route
router.delete('/property/:id', isAuthenticated, async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (property) {
            res.status(200).send('Property deleted successfully');
        } else {
            res.status(404).send('Property not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting property');
    }
});

// Serve registration form
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).redirect('/login.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});


// Serve login form
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            req.session.user = user;
            res.status(200).redirect('/upload');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
