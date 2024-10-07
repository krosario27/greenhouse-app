const mongoose = require('mongoose');

//Define schema for sensor readings
const readingSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    temperature: { type: Number },
    humidity: { type: Number },
    soil_moisture: { type: Number },
    co2_levels: { type: Number }
});

// Define schema for sensors (internal/external)
const sensorSchema = new mongoose.Schema({
    sensor_id: { type: Number, required: true },
    sensor_type: { type: String, enum: ['Internal', 'External'], required: true },
    readings: [readingSchema]
});

// Define schema for greenhouses.
const greenhouseSchema = new mongoose.Schema({
    greenhouse_id: { type: String, required: true },
    sensors: [sensorSchema]
});

// Define Location that houses multiple greenhouses
const locationSchema = new mongoose.Schema({
    location: { type: String, required: true },
    greenhouses: [greenhouseSchema]
});

module.exports = mongoose.model('Location', locationSchema);