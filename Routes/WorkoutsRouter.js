const recommendations = require('../Controllers/Workouts/Recommendations')
const { ScheduleWorkouts, markExerciseComplete, getExersices } = require('../Controllers/Workouts/ScheduleWorkouts')

const WorkoutRouter = require('express').Router()

WorkoutRouter.post('/workouts/schedule/',ScheduleWorkouts)
WorkoutRouter.put('/workouts/schedule/completion/:userId/:exerciseName',markExerciseComplete)
WorkoutRouter.get('/workouts/schedule/completion/:userId/:day',getExersices)
WorkoutRouter.get('/workouts/recommendations/:userId/',recommendations)

module.exports = WorkoutRouter