const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Location = require('./models/Greenhouse');

// COnnect to MongoDB
mongoose.connect('mongodb://localhost:27017/greenhouse_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB")).catch(err => console.log(err));

// Setup Express app
const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// CSV Import function
const importCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        // Initialize empty arra for data to be stored in.
        let dataRows = [];
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            dataRows.push(row);
        })
        .on('end', async () => {
            for (let row of dataRows) {
                const {
                    location,
                    greenhouse_id,
                    sensor_id,
                    sensor_type,
                    timestamp,
                    temperature,
                    humidity,
                    soil_moisture,
                    co2_levels
                } = row;

                const reading = {
                    timestamp: parseFloat(timestamp),
                    temperature: parseFloat(temperature),
                    humidity: parseFloat(humidity),
                    soil_moisture: parseFloat(soil_moisture),
                    co2_levels: parseFloat(co2_levels)
                };

                let locationDoc = await Location.findOne({ location });
                if (!locationDoc) {
                    locationDoc = new Location({
                        location,
                        greenhouses: [{
                            greenhouse_id,
                            sensors: [{
                                sensor_id,
                                sensor_type,
                                readings: [reading]
                            }]
                        }]
                    });
                } else {
                    let greenhouse = locationDoc.greenhouses.find(g => g.greenhouse_id === greenhouse_id);
                    if (!greenhouse) {
                        locationDoc.greenhouses.push({
                            greenhouse_id,
                            sensors: [{
                                sensor_id,
                                sensor_type,
                                readings: [reading]
                            }]
                        });
                    } else {
                        let sensor = greenhouse.sensors.find(s => s.sensor_id === sensor_id);
                        if (!sensor) {
                            greenhouse.sensor.push({
                                sensor_id,
                                sensor_type,
                                readings: [reading]
                            });
                        } else {
                            sensor.readings.push(reading);
                        }
                    }
                }
                await locationDoc.save()
            }
            resolve("CSV data successfully imported!");
        })
        .on('error', (error) => {
            reject(error);
        });
    });
};