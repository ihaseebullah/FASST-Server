const createSocialProfile = require('../Controllers/Data-Gathering/SocialUser')
const { createMeetup, getMeetups, updateMeetupStatus } = require('../Controllers/Social/Meetups')
const { InitializeApp, GetSocialUser, EditUser, updateLocation, getUsersLocations } = require('../Controllers/Social/UserData')
const { CreatePost, GetPosts } = require('../Controllers/Social/UserPosts')

const SocialRouter = require('express').Router()

// Basic Information
SocialRouter.post('/social/initialize/create-social-profile', createSocialProfile)
SocialRouter.get('/social/get-user/:socialUserId', GetSocialUser)
SocialRouter.put('/social/edit-user/:socialUserId', EditUser)

//Social Interactions
SocialRouter.post('/social/interactions/post', CreatePost)
SocialRouter.get('/social/interactions/getPosts/:socialUserId', GetPosts)

//location
SocialRouter.put('/social/interactions/update/location/:socialUserId', updateLocation)
SocialRouter.get('/social/interactions/get/location/:userId', getUsersLocations)

//Meetups
SocialRouter.post('/social/interactions/meetups', createMeetup)
SocialRouter.get('/social/interactions/meetups/:socialId', getMeetups)
SocialRouter.put('/social/meetups/status/:meetupId/:status', updateMeetupStatus)

module.exports = SocialRouter