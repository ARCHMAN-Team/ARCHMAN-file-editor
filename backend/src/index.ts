import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import csvParser from 'csv-parser';
import fs from 'fs';

const app = express();
const csv = require('csv-writer').createObjectCsvStringifier;

app.use(cors()); // Enable CORS middleware
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL request bodies
app.use(bodyParser.json()); // Parse JSON request bodies
app.get('/', (req, res) => { res.send('Server is working!'); }); // Define a route for the root URL ('/') that sends a response


const csvFilePath = '/home/docs/data/spreadsheets/etd2006/etd2006.csv'; //metadata file path
const configFilePath = '/home/docs/project/backend/property-configs.csv'; //config file path

app.use(express.json()); // Middleware to parse JSON requests

app.get('/api/data', (req, res) => { // Define a route for fetching data
    const rows: any[] = []; // Initialize an array to store data rows
    fs.createReadStream(csvFilePath) // Read the CSV file
        .pipe(csvParser()) // Pipe the CSV stream to the CSV parser
        .on('data', (row) => rows.push(row)) // On each row, add it into the rows array
        .on('end', () => res.json(rows)) // When the CSV parsing is done send the rows as JSON 
        .on('error', (err) => res.status(500).send(err.message)); // Handle errors with a 500 status
});

app.get('/api/configs', (req, res) => { // Define a route for fetching configs
    const rows: any[] = []; // Initialize an array to store config rows
    fs.createReadStream(configFilePath) // Read the config CSV file
        .pipe(csvParser()) // Pipe the CSV stream to the CSV parser
        .on('data', (row) => rows.push(row)) // On each data row add it into the rows array
        .on('end', () => res.json(rows)) // When the CSV parsing is done send the rows as JSON
        .on('error', (err) => res.status(500).send(err.message)); // Handle errors with a 500 status
});


app.post('/api/save', (req, res) => { // Define  POST route for saving data
    const jsonData = req.body; // Get JSON data from the request body

    if (!Array.isArray(jsonData)) { // Check if the JSON data is an array
        return res.status(400).json({ message: 'Invalid data format' }); // Return a 400 response if invalid data format
    }

    const csvStringifier = csv({
        header: Object.keys(jsonData[0]), // Set the CSV header to the keys of the first JSON object
    });

    const csvString = csvStringifier.header.join(',') + '\n' + csvStringifier.stringifyRecords(jsonData); // Convert JSON data to CSV string

    fs.writeFile(csvFilePath, csvString, (err) => { // Write the CSV string to a file
        if (err) {
            console.error('Error saving CSV data:', err);
            return res.status(500).json({ message: 'Error saving CSV' }); // Return a 500 response for write error
        }
        console.log('CSV saved successfully');
        res.status(200).json({ message: 'CSV saved successfully' }); // Return a 200 response for successful save
    });
});

app.post('/api/save-config', (req, res) => { // Define a POST route for saving configuration data
    const jsonData = req.body; // Get JSON data from the request body

    if (!Array.isArray(jsonData)) { // Check if the JSON data is array
        return res.status(400).json({ message: 'Invalid data format' }); // Return a 400 response for invalid data format
    }

    const csvStringifier = csv({
        header: Object.keys(jsonData[0]), // Set the CSV header to the keys of the first JSON object
    });

    const csvString = csvStringifier.header.join(',') + '\n' + csvStringifier.stringifyRecords(jsonData); // Convert JSON data to CSV string

    fs.writeFile(configFilePath, csvString, (err) => { // Write the CSV string to a file
        if (err) {
            console.error('Error saving config CSV:', err);
            return res.status(500).json({ message: 'Error saving CSV' }); // Return a 500 response for write error
        }

        console.log('CSV saved successfully');
        res.status(200).json({ message: 'CSV saved successfully' }); // Return a 200 response for successful save
    });
});

function getFilesInDirectory(directoryPath: string): string[] { // Define a function to get file names in a directory
    const fileNames: string[] = []; // Initialize an array to store file names
    const files = fs.readdirSync(directoryPath); // Read files in the dir
    for (const file of files) { // Loop through the files
        if (fs.statSync(`${directoryPath}/${file}`).isFile()) { // Check if it's a file 
            fileNames.push(file); // Add the file name to the array
        }
    }
    return fileNames;
}

app.get('/api/files', (req, res) => { // Define a GET route to fetch files in a directory
    const requestedDirectoryPath = req.query.directoryPath as string; // Get the directory path from the query parameter
    if (!requestedDirectoryPath) { // Check if the directoryPath is missing
        res.status(400).send("Missing directoryPath parameter"); // Return a 400 response
        return;
    }

    try {
        const filesArray = getFilesInDirectory(requestedDirectoryPath); // Call the function to get file names
        res.send(filesArray); // Send the array of file names as a response
    } catch (error: any) {
        res.status(500).send('Error fetching files: ' + error.message); // Return a 500 response with an error message
    }
});


const PORT = 8080; //backend routing port
app.listen(PORT, () => {
    console.log('Server is running on port 8080.');
});
