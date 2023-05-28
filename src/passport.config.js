import express from "express";
import session from "express-session";

import passport from "passport"
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'
import UserModel from './dao/models/user.model.js'
import { createHash, isValidPassword } from './utils.js'

const LocalStrategy = local.Strategy

const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body
        try {
            const user = await UserModel.findOne({ email: username })
            if (user) {
                console.log('User already exists')
                return done(null, false)
            }

            const newUser = {
                first_name, last_name, email, age, 
                password: createHash(password)
            }
            const result = await UserModel.create(newUser)
            return done(null, result)
        } catch(err) {
            return done('Error al leer la BD')
        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async(username, password, done) => {
        try {
            const user = await UserModel.findOne({ email: username })
            if (!user) {
                console.log('User does not exists')
                return done(null, user)
            }

            if (!isValidPassword(user, password)) return done(null, false)

            return done(null, user)
        } catch(err) {}
    }))

//Github
    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.91a8f7bd9d745543',
        clientSecret: '47ce462d89d95565f37932e998f115764ce7989f',
        callbackURL: 'http://localhost:8080/api/session/githubcallback'
    }, async(accessToken, refreshToken, profile, done) => {
        console.log(profile)
        try {
            const user = await UserModel.findOne({ email: profile._json.email })
            if (user) return done (null, user)

            const newUser = await UserModel.create({
                first_name: profile._json.name,
                email: profile._json.email,
            })

            return done(null, newUser)
        } catch(err) {
            return done ('Error to login with GitHub')
        }
    }))  
//fin Github

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser(async(id, done) => {
        const user = await UserModel.findById(id)
        done(null, user)
    })
}

export default initializePassport