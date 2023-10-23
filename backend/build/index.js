"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.send('Server is working!');
});
// Define your data as an array of objects
const dataArray = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Laylaa' },
    // Add more data as needed
];
// Endpoint to get the array of data
app.get('/api', (req, res) => {
    res.json(dataArray);
    console.log(dataArray);
});
const csvFilePath = 'data.csv';
const PORT = 8080; //backend routing port
app.listen(PORT, () => {
    console.log('Server is running on port 8080.');
});
