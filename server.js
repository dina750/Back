import connectDB from './config/db.js';
import path from 'path'
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan'
import colors from 'colors'
import passport from 'passport';
import cookieSession from 'cookie-session';
import userRoutes from './routes/userRoutes.js'
import cors from 'cors'

import { notFound, errorHandler } from './middleware/errorMiddlware.js'

dotenv.config('./../.env');

connectDB();



const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json())

app.use(cors({
    origin: '*'
}));

app.use('/api/users', userRoutes);



const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/front/build')))

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'front', 'build', 'index.html')))
} else {
    app.get('/', (req, res) => {
        res.send("API is running");
    })
}

app.use(notFound)
app.use(errorHandler)



app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

app.use(passport.initialize());

app.use(passport.session())

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/failed', (req, res) => res.send('You Failed to log in!'))

app.get('/good',  (req, res) => {
    console.log(req.user.photos[0].value)
    res.render('pages/profile.ejs',{
        name:req.user.displayName,
        pic:req.user._json.picture,
        email:req.user.emails[0].value,
        profile: "google"
    })
})

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', 
    passport.authenticate('google', 
    {failureRedirect: '/failed'}), 
    (req, res) => {
        res.redirect('/good');
    })

app.get('/profile',  (req,res) => {
    console.log("----->",req.user)
    res.render('pages/profile', {
        profile: "facebook",
        name:req.user.displayName,
        pic:req.user.photos[0].value,
        email:req.user.emails[0].value // get the user out of session and pass to template
    });
})

app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect : '/profile',
        failureRedirect : '/'
    }
));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;

app.listen(
    PORT,
    console.log(`Server running ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold)
);