import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


type DynamicTableEntry<T extends string[]> = {
    [K in T[number]]: any;
};

const CSVTable: React.FC = () => {
    const [data, setData] = useState<DynamicTableEntry<string[]>[]>([]);
    const [configData, setConfigData] = useState<DynamicTableEntry<string[]>[]>([]);
    const [propertyNames, setPropertyNames] = useState<string[]>([]);
    const [configDataPropertyNames, setConfigDataPropertyNames] = useState<string[]>([]);
    const [contextMenuData, setContextMenuData] = useState<{ rowIndex: number, colIndex: number, propertyName: string } | null>(null);
    const [clickedCellData, setClickedCellData] = useState<{ rowIndex: number, colIndex: number, propertyName: string } | null>(null);
    const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number } | null>(null);
    const [filesFromPath, setFilesFromPath] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [showAddColumnPopup, setShowAddColumnPopup] = useState(false);
    const [showEditColumnPopup, setShowEditColumnPopup] = useState(false);
    const [showSelectFilePopup, setShowSelectFilePopup] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [sideToAddColumn, setSideToAddColumn] = useState(-1);
    const [newColMandatory, setNewColMandatory] = useState(false);
    const [newColRepeatable, setNewColRepeatable] = useState(false);
    const [newColType, setNewColType] = useState("text");
    const [newColDropdownOption, setNewColDropdownOption] = useState<string>("");
    const [newColDropdownOptions, setNewColDropdownOptions] = useState<string[]>([]);
    const [newColFilePath, setNewColFilePath] = useState<string>("");
    const [newColDateFormat, setNewColDateFormat] = useState<string>("year");
    const [editColumnName, setEditColumnName] = useState<string>("");
    const [editColMandatory, setEditColMandatory] = useState(false);
    const [editColRepeatable, setEditColRepeatable] = useState(false);
    const [editColType, setEditColType] = useState<string>("text");
    const [editColDropdownOption, setEditColDropdownOption] = useState<string>("");
    const [editColDropdownOptions, setEditColDropdownOptions] = useState<string[]>([]);
    const [editColFilePath, setEditColFilePath] = useState<string>("");
    const [editColDateFormat, setEditColDateFormat] = useState<string>("year");
    const [insertColumnError, setInsertColumnError] = useState<string>("");
    const [editColumnError, setEditColumnError] = useState<string>("");
    const [deleteColumnError, setDeleteColumnError] = useState<string>("");
    const [savingDataError, setSavingDataError] = useState<string>("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [savingSuccess, setSavingSuccess] = useState<string>("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteRowConfirmation, setDeleteRowConfirmation] = useState<string>("");
    const [deleteColConfirmation, setDeleteColConfirmation] = useState<string>("");
    const [saveConfirmation, setSaveConfirmation] = useState<string>("");

    useEffect(() => {
        fetchCSVData(); // fetch CSV data
        fetchColumnConfigData(); // fetch column configuration data
    }, []);

    useEffect(() => {
        window.addEventListener('click', handleCloseContextMenu); // Add event listener for closing a context menu
        return () => {
            window.removeEventListener('click', handleCloseContextMenu); // Remove event listener
        };
    }, []);

    const fetchCSVData = async () => { // function to fetch CSV data
        try {
            const response = await axios.get('http://localhost:8080/api/data'); // Make an API request to fetch data
            const jsonData: DynamicTableEntry<string[]>[] = response.data; // Process the response data
            setData(jsonData); // Update data with retrieved data
            const firstEntry = jsonData[0];
            if (firstEntry) {
                const keys = Object.keys(firstEntry);
                setPropertyNames(keys); // Set property names based on the keys of the first entry
            }
        } catch (error) {
            console.error('Error fetching data:', error); // Handle errors
        }
    };

    const fetchColumnConfigData = async () => { // function to fetch column configuration data
        try {
            const response = await axios.get('http://localhost:8080/api/configs'); // Make an API request to fetch data
            const jsonData: DynamicTableEntry<string[]>[] = response.data; // Process the response data
            setConfigData(jsonData); // Update configData
            const firstEntry = jsonData[0];
            if (firstEntry) {
                const keys = Object.keys(firstEntry);
                setConfigDataPropertyNames(keys); // Set column configuration property names based on the keys of the first entry
            }
        } catch (error) {
            console.error('Error fetching data:', error); // Handle errors
        }
    };

    const fetchFilesFromPath = async (directoryPath: string) => { // function to fetch files from a directory
        if (directoryPath !== "") {
            try {
                const response = await axios.get(`http://localhost:8080/api/files?directoryPath=${encodeURIComponent(directoryPath)}`); // Make an API request to fetch files
                const responseArray = response.data; // Process the response data
                setFilesFromPath(responseArray.map((file: string) => directoryPath.split("/").pop() + "/" + file)); // Update with the fetched files
            } catch (error) {
                console.error('Error fetching data:', error); // Handle errors
            }
        }
    };


    const handleCellValueChange = (index: number, propertyName: string, value: any) => {
        const updatedData = [...data]; // Create a copy of the current data array
        updatedData[index][propertyName] = value; // Update the specific cell value
        setData(updatedData); // Update with the updated data
        console.log(updatedData);
    };


    const handleSaveButtonClick = async () => { // Define a function to handle the save button click
        try {
            let isError = false; // Initialize an error flag

            // Clean property names by trimming whitespace
            const cleanedPropertyNames = propertyNames.map(name => name.trim());

            // Clean data entries and ensure they match the cleaned property names
            const cleanedData = data.map(entry => {
                const cleanedEntry: DynamicTableEntry<string[]> = {};
                for (const propertyName of cleanedPropertyNames) {
                    cleanedEntry[propertyName] = entry[propertyName] ? entry[propertyName].trim() : ''; // Check before trimming
                }
                return cleanedEntry;
            });

            // Clean configuration data entries and ensure they match the cleaned config property names
            const cleanedConfigData = configData.map(entry => {
                const cleanedConfigEntry: DynamicTableEntry<string[]> = {};
                for (const configPropertyName of configDataPropertyNames) {
                    cleanedConfigEntry[configPropertyName] = entry[configPropertyName] ? entry[configPropertyName].trim() : ''; // Check before trimming
                }
                return cleanedConfigEntry;
            });

            // Iterate through configuration data
            for (let i = 0; i < cleanedConfigData.length; i++) {
                if (cleanedConfigData[i].mandatory === "true") { // Check if a field is mandatory
                    let colName = cleanedConfigData[i].field;

                    // Iterate through cleaned data entries for this field
                    for (let j = 0; j < cleanedData.length; j++) {
                        if (cleanedData[j][colName] === "") { // Check for empty cells
                            setSavingDataError(colName + " is a mandatory field and cannot have empty cells.");
                            setShowError(true);
                            isError = true;
                            break;
                        }
                    }
                }
                if (cleanedConfigData[i].repeatable === "false") { // Check if a field is not repeatable
                    let colName = cleanedConfigData[i].field;

                    // Iterate through cleaned data entries for this field
                    for (let j = 0; j < cleanedData.length; j++) {
                        if (cleanedData[j][colName].includes('|')) { // Check for cells with more than one value
                            setSavingDataError(colName + " is not a repeatable field and cannot have cells with more than one value.");
                            setShowError(true);
                            isError = true;
                            break;
                        }
                    }
                }
            }

            if (!isError) { // If no errors
                await axios.post('http://localhost:8080/api/save', cleanedData); // Send a POST request to save data
                await axios.post('http://localhost:8080/api/save-config', cleanedConfigData); // Send a POST request to save configuration data
                setSavingSuccess("Data saved successfully.");
                setShowSuccess(true);
                fetchColumnConfigData(); // Fetch updated column configuration data
                fetchCSVData(); // Fetch updated CSV data
            }
        } catch (error) {
            console.error('Error saving data:', error);
            setShowError(true);
            setSavingDataError("An unexpected error occurred while saving. Please try again.");
        }
    };


    const handleContextMenu = (event: React.MouseEvent<HTMLTableCellElement>, rowIndex: number, colIndex: number, propertyName: string) => {
        event.preventDefault(); // Prevent the default right-click context menu
        const cursorTop = event.clientY + window.scrollY; // Calculate the cursor's top position
        const cursorLeft = event.clientX + window.scrollX; // Calculate the cursor's left position
        setCursorPosition({ top: cursorTop, left: cursorLeft }); // Update cursor position state
        setClickedCellData({ rowIndex, colIndex, propertyName }); // Set clicked cell data state
        setContextMenuData({ rowIndex, colIndex, propertyName }); // Set context menu data state
    };

    const handleCloseContextMenu = () => {
        setContextMenuData(null); // Clear context menu data state
    };

    const handleContextMenuAction = (action: string) => {
        if (contextMenuData) {
            const updatedData = [...data]; // Create a copy of the current data array

            if (action === 'Edit column') { // Handle "Edit column" action
                console.log(configData); // Log configuration data
                setEditColumnName(contextMenuData.propertyName); // Set column name to edit
                setEditColMandatory(JSON.parse(configData[contextMenuData.colIndex].mandatory)); // Parse and set column mandatory state
                setEditColRepeatable(JSON.parse(configData[contextMenuData.colIndex].repeatable)); // Parse and set column repeatable state
                setEditColType(configData[contextMenuData.colIndex].type); // Set column type
                if (configData[contextMenuData.colIndex].type === "dropdown") {
                    setEditColDropdownOptions(configData[contextMenuData.colIndex].inputInfo.split('|')); // Parse and set dropdown options
                } else if (configData[contextMenuData.colIndex].type === "filepath") {
                    setEditColFilePath(configData[contextMenuData.colIndex].inputInfo); // Set file path
                } else if (configData[contextMenuData.colIndex].type === "date") {
                    setEditColDateFormat(configData[contextMenuData.colIndex].inputInfo); // Set date format
                }
                setShowEditColumnPopup(true); // Show the edit column popup
            } else if (action === 'Insert row above') { // Handle "Insert row above" action
                const emptyRow: DynamicTableEntry<string[]> = {};
                propertyNames.forEach(propertyName => {
                    emptyRow[propertyName] = '';
                });
                updatedData.splice(contextMenuData.rowIndex, 0, emptyRow); // Insert an empty row above the selected row
            } else if (action === 'Insert row below') { // Handle "Insert row below" action
                const emptyRow: DynamicTableEntry<string[]> = {};
                propertyNames.forEach(propertyName => {
                    emptyRow[propertyName] = '';
                });
                updatedData.splice(contextMenuData.rowIndex + 1, 0, emptyRow); // Insert an empty row below the selected row
            } else if (action === 'Insert column to the right') { // Handle "Insert column to the right" action
                setShowAddColumnPopup(true); // Show the add column popup
                setSideToAddColumn(1); // Set the side to add the column 
            } else if (action === 'Insert column to the left') { // Handle "Insert column to the left" action
                setShowAddColumnPopup(true); // Show the add column popup
                setSideToAddColumn(0); // Set the side to add the column 
            } else if (action === 'Clear cell') { // Handle "Clear cell" action
                if (configData[contextMenuData.colIndex].type === "dropdown") {
                    const inputInfo = configData[contextMenuData.colIndex].inputInfo;
                    updatedData[contextMenuData.rowIndex][contextMenuData.propertyName] = inputInfo.split('|')[0];
                }
                updatedData[contextMenuData.rowIndex][contextMenuData.propertyName] = ''; // Clear the cell value
            } else if (action === 'Delete row') { // Handle "Delete row" action
                setDeleteRowConfirmation("Are you sure you want to delete this row?"); // Set delete row confirmation message
                setShowConfirm(true); // Show confirmation dialog
            } else if (action === 'Delete column') { // Handle "Delete column" action
                const propertyNameToDelete = propertyNames[contextMenuData.colIndex];

                if (configData[contextMenuData.colIndex].mandatory === "true") {
                    setShowError(true); // Show an error message
                    setDeleteColumnError(propertyNameToDelete + " is a mandatory field and cannot be deleted."); // Set delete column error message
                    handleCloseContextMenu(); // Close the context menu
                    return; // Exit the function
                }

                setDeleteColConfirmation("Are you sure you want to delete this column?"); // Set delete column confirmation message
                setShowConfirm(true); // Show confirmation 
            }

            setData(updatedData); // Update the component state with the updated data
            handleCloseContextMenu(); // Close the context menu
        }
    };


    const handlePropertyNameChange = (index: number, newName: string) => {
        const updatedPropertyNames = [...propertyNames]; // Create a copy of the current property names array
        updatedPropertyNames[index] = newName; // Update the property name at the specified index
        setPropertyNames(updatedPropertyNames); // Update the component state with the updated property names

        const updatedConfigData = [...configData]; // Create a copy of the current config data array
        updatedConfigData[index].field = newName; // Update the 'field' property in the config data at the specified index
        setConfigData(updatedConfigData); // Update the component state with the updated config data
    };

    const handleDeleteRow = () => { // function to handle deleting a row
        const updatedData = [...data]; // Create a copy of the current data array

        if (clickedCellData) { // Check if cell data is available
            updatedData.splice(clickedCellData.rowIndex, 1); // Remove the row at the specified index
        }
        setData(updatedData); // updated data
    };

    const handleDeleteCol = () => { // function to handle deleting a column
        const updatedData = [...data]; // Create a copy of the current data array
        console.log(clickedCellData);

        if (clickedCellData) { // Check if cell data is set
            const updatedData = [...data]; // Create copy of the current data array
            propertyNames.splice(clickedCellData.colIndex, 1); // Remove the property name at the specified index
            updatedData.forEach(row => {
                delete row[clickedCellData.propertyName]; // Delete the property from each row
            });
            const updatedConfigData = [...configData]; // Create a copy of the current config data array
            updatedConfigData.splice(clickedCellData.colIndex, 1); // Remove the config data for the column at the specified index
            setData(updatedData); // updated data
            setConfigData(updatedConfigData); // updated config data
        }

        setData(updatedData); // updated data
    };

    const changeColType = () => {
        const updatedData = [...data];
        if (clickedCellData) {
            if (configData[clickedCellData.colIndex].field !== editColType) {
                updatedData.forEach(row => {
                    row[configData[clickedCellData.colIndex].field] = '';
                });
            }
        }
        setData(updatedData); // updated data
    }


    const handleAddColumn = () => {
        const filePathPattern = /^\/(?:[^/]+\/)*[^/]+/; // Regular expression pattern for validating file paths

        if (newColumnName.trim() === '') { // Check if the new column name is empty
            setInsertColumnError('Please enter a column name.'); // Set an error message
        }
        else if (newColumnName.includes(" ")) { // Check if the new column name contains spaces
            setInsertColumnError('Column name cannot contain spaces.'); // Set an error message
        }
        else if (newColType === 'dropdown' && newColDropdownOptions.length === 0) { // Check if the new column type is dropdown and no options are provided
            setInsertColumnError('Please provide dropdown options.'); // Set an error message
        }
        else if (newColType === 'filepath' && newColFilePath === '') { // Check if the new column type is filepath and no path is provided
            setInsertColumnError('Please provide a file path.'); // Set an error message
        }
        else if (newColType === 'filepath' && newColFilePath.includes(" ")) { // Check if the new filepath contains spaces
            setInsertColumnError('File path cannot contain spaces.'); // Set an error message
        }
        else if (newColType === 'filepath' && !filePathPattern.test(newColFilePath)) { // Check if the new filepath is in a valid format
            setInsertColumnError('Please provide a valid file path.'); // Set an error message
        }
        else if (clickedCellData && clickedCellData.rowIndex !== -1 && newColumnName.trim() !== '') {
            const updatedData = [...data]; // Create a copy of the current data array
            const updatedConfigData = [...configData]; // Create a copy of the current config data array

            // Insert the new column name into the property names array
            propertyNames.splice(clickedCellData.colIndex + sideToAddColumn, 0, newColumnName);

            // Add the new column to each row in the data array
            updatedData.forEach(row => {
                row[newColumnName] = '';
            });
            setData(updatedData); // updated data

            // Create a new row in the configData array for the new column
            const newConfigRow: DynamicTableEntry<string[]> = {};

            configDataPropertyNames.forEach(propertyName => {
                if (propertyName === 'field') {
                    newConfigRow[propertyName] = newColumnName;
                }
                else if (propertyName === 'mandatory') {
                    newConfigRow[propertyName] = newColMandatory.toString();
                }
                else if (propertyName === 'repeatable') {
                    newConfigRow[propertyName] = newColRepeatable.toString();
                }
                else if (propertyName === 'type') {
                    newConfigRow[propertyName] = newColType;
                }
                else if (propertyName === 'inputInfo' && newColType === 'dropdown') {
                    newConfigRow[propertyName] = newColDropdownOptions.join('|');
                    setEditColDropdownOptions(newColDropdownOptions);
                }
                else if (propertyName === 'inputInfo' && newColType === 'filepath') {
                    newConfigRow[propertyName] = newColFilePath;
                    setEditColFilePath(newColFilePath);
                }
                else if (propertyName === 'inputInfo' && newColType === 'date') {
                    newConfigRow[propertyName] = newColDateFormat;
                    setEditColDateFormat(newColDateFormat);
                }
                else {
                    newConfigRow[propertyName] = '';
                }
            });

            // Insert the new config row into the configData array
            updatedConfigData.splice(clickedCellData.colIndex + sideToAddColumn, 0, newConfigRow);
            setConfigData(updatedConfigData); // updated config data

            // Clear form inputs, error message, and close the add column popup
            setShowAddColumnPopup(false);
            setNewColumnName('');
            setNewColMandatory(false);
            setNewColRepeatable(false);
            setNewColType('text');
            setInsertColumnError('');
            console.log(updatedConfigData);
        }
    };


    const handleEditColumn = () => {
        const filePathPattern = /^\/(?:[^/]+\/)*[^/]+/; // Regular expression pattern for validating file paths

        if (editColumnName.trim() === '') { // Check if the edited column name is empty
            setEditColumnError('Please enter a column name.'); // Set an error message
        }
        else if (editColumnName.includes(" ")) { // Check if the edited column name contains spaces
            setEditColumnError('Column name cannot contain spaces.'); // Set error message
        }
        else if (editColType === 'dropdown' && editColDropdownOptions.length === 0) { // Check if the edited column type is dropdown and no options are provided
            setEditColumnError('Please provide dropdown options.'); // Set error message
        }
        else if (editColType === 'filepath' && editColFilePath === '') { // Check if the edited column type is filepath and no path is provided
            setEditColumnError('Please provide a file path.'); // Set error message
        }
        else if (editColType === 'filepath' && editColFilePath.includes(" ")) { // Check if the edited filepath contains spaces
            setEditColumnError('File path cannot contain spaces.'); // Set error message
        }
        else if (editColType === 'filepath' && !filePathPattern.test(editColFilePath)) { // Check if the edited filepath is in a valid format
            setEditColumnError('Please provide a valid file path.'); // Set error message
        }
        else if (clickedCellData && clickedCellData.rowIndex !== -1 && editColumnName.trim() !== '') {
            const updatedData = [...data]; // Create a copy of the current data array
            const updatedConfigData = [...configData]; // Create a copy of the current config data array

            // Update properties in the config data based on the edit form inputs
            updatedConfigData[clickedCellData.colIndex].mandatory = editColMandatory.toString();
            updatedConfigData[clickedCellData.colIndex].repeatable = editColRepeatable.toString();
            updatedConfigData[clickedCellData.colIndex].type = editColType;

            if (editColType === "dropdown") {
                updatedConfigData[clickedCellData.colIndex].inputInfo = editColDropdownOptions.join('|');
            }
            else if (editColType === "filepath") {
                updatedConfigData[clickedCellData.colIndex].inputInfo = editColFilePath;
            }
            else if (editColType === "date") {
                updatedConfigData[clickedCellData.colIndex].inputInfo = editColDateFormat;
            }

            // Update the column name if it has changed
            if (editColumnName !== clickedCellData.propertyName) {
                updatedConfigData[clickedCellData.colIndex].field = editColumnName; // Update in config data
                propertyNames[clickedCellData.colIndex] = editColumnName; // Update in property names array

                // Update the data array to reflect the column name change
                updatedData.forEach(row => {
                    row[editColumnName] = row[clickedCellData.propertyName]; // Copy data from old column to new column
                    delete row[clickedCellData.propertyName]; // Delete the old column data
                });
            }

            console.log(updatedConfigData);
            setData(updatedData); // Update the component state with the updated data
            setConfigData(updatedConfigData); // Update the component state with the updated config data
            setShowEditColumnPopup(false); // Close the edit column popup
            setEditColumnName(''); // Clear the edit column name input
            setEditColumnError(""); // Clear the edit column error message
            setEditColMandatory(false); // Reset the edit column mandatory flag
            setEditColRepeatable(false); // Reset the edit column repeatable flag
            changeColType();
        }
    };


    const chToPx = (valueInCh: number) => {
        const oneCharWidthPx = 13; // Estimated width of one character in pixels
        const valueInPx = valueInCh * oneCharWidthPx; // Convert value from ch to px
        return valueInPx; // Return the value in pixels
    };

    const handleAddDropdownOption = () => {
        if (newColDropdownOption.trim() !== "") { // Check if the new dropdown option is not empty after trimming
            setNewColDropdownOptions([...newColDropdownOptions, newColDropdownOption.trim()]); // Add the new option to the dropdown options array
            setNewColDropdownOption(""); // Clear the new option input
        }
    };

    const handleAddDropdownOptionEdit = () => {
        if (editColDropdownOption.trim() !== "") { // Check if the edited dropdown option is not empty after trimming
            setEditColDropdownOptions([...editColDropdownOptions, editColDropdownOption.trim()]); // Add the edited option to the dropdown options array
            setEditColDropdownOption(""); // Clear the edited option input
        }
    };

    const handleDeleteDropdownOption = (index: number) => {
        const updatedOptions = newColDropdownOptions.filter((_, i) => i !== index); // Create a new array without the selected dropdown option
        setNewColDropdownOptions(updatedOptions); // Update the dropdown options with the filtered array
    };

    const handleDeleteDropdownOptionEdit = (index: number) => {
        const updatedOptions = editColDropdownOptions.filter((_, i) => i !== index); // Create a new array without the selected edited dropdown option
        setEditColDropdownOptions(updatedOptions); // Update the edited dropdown options with the filtered array
    };

    const handleSelectedFilesChange = (item: string, isRepeatable: boolean) => {
        if (isRepeatable) {
            if (selectedFiles.includes(item)) { // Check if the item is already in the selected files array
                setSelectedFiles(selectedFiles.filter(selectedFile => selectedFile !== item)); // Remove the item from the selected files array
            } else {
                setSelectedFiles([...selectedFiles, item]); // Add the item to the selected files array
            }
            console.log(selectedFiles.length);
        }
        else {
            setSelectedFiles([item]);
        }
    };

    const handleSelectedFiles = () => {
        console.log(data);
        const updatedData = [...data]; // Create a copy of the current data array
        if (clickedCellData) {
            if (selectedFiles[0] === "") {
                selectedFiles.shift(); // Remove the empty string if it's the first element in the selected files array
            }
            updatedData[clickedCellData.rowIndex][clickedCellData.propertyName] = selectedFiles.join("|"); // Update the data with the selected files joined by "|"
        }
        setData(updatedData); // Updated data
        console.log(updatedData);
        setSelectedFiles([]); // Clear the selected files array
        setShowSelectFilePopup(false); // Close the file selection popup
    };



    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {propertyNames.map((propertyName, colIndex) => (
                            <th key={colIndex}>
                                <input
                                    className='column-heading'
                                    type="text"
                                    value={propertyName}
                                    style={{ width: `${chToPx(propertyName.length)}px` }}
                                    onChange={(e) =>
                                        handlePropertyNameChange(colIndex, e.target.value)
                                    }
                                />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry, rowIndex) => (
                        <tr key={rowIndex}>
                            {propertyNames.map((propertyName, colIndex) => {
                                // Calculate average character count for the current column
                                const totalChars = data.reduce((acc, entry) => acc + entry[propertyName]?.length, 0);
                                const avgChars = totalChars / 15;//data.length;

                                return (
                                    <td
                                        key={colIndex}
                                        onClick={() => {
                                            setClickedCellData({ rowIndex, colIndex, propertyName });
                                            console.log(data[rowIndex][propertyName]);
                                            if (configData[colIndex].type === "filepath") {
                                                console.log(data[rowIndex][propertyName]);
                                                setSelectedFiles(data[rowIndex][propertyName].split("|").map((item: string) => item.trim()));
                                                setShowSelectFilePopup(true);
                                                fetchFilesFromPath(configData[colIndex].inputInfo);
                                            }
                                        }}
                                        onContextMenu={(e) => handleContextMenu(e, rowIndex, colIndex, propertyName)}
                                    >
                                        {configData[colIndex] && configData[colIndex].type === "dropdown" ? (
                                            <select
                                                className='dropdown-select'
                                                value={entry[propertyName]}
                                                style={{ width: `${chToPx(propertyName.length) + (avgChars)}px` }}
                                                onChange={(e) => handleCellValueChange(rowIndex, propertyName, e.target.value)}
                                            >
                                                {configData[colIndex].inputInfo.split('|').map((option: string, index: number) => (
                                                    <option className='normal-text' key={index} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : configData[colIndex] && configData[colIndex].type === "filepath" ? (
                                            <textarea
                                                className='cell-textarea'
                                                value={entry[propertyName]} readOnly
                                                style={{ width: `${chToPx(propertyName.length) + (avgChars)}px` }}
                                            />
                                        ) : configData[colIndex] && configData[colIndex].type === "date" ? (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                {configData[colIndex].inputInfo === "year" ? (
                                                    <DatePicker
                                                        openTo="year"
                                                        views={['year']}
                                                        value={dayjs(entry[propertyName], 'YYYY').startOf('year')}
                                                        onChange={(e) => handleCellValueChange(rowIndex, propertyName, dayjs(e).format('YYYY'))}
                                                        slotProps={{ textField: { size: 'small' } }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                            "& .MuiOutlinedInput-input": {
                                                                fontSize: 14,
                                                                fontFamily: 'Roboto',
                                                                width: '40px',
                                                                fontWeight: 'light',
                                                                paddingTop: 0,
                                                                paddingLeft: 0,
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                paddingTop: 0, // Remove padding from the root element
                                                                paddingLeft: 0,
                                                            },
                                                        }}
                                                    />
                                                ) : configData[colIndex].inputInfo === "month" ? (
                                                    <DatePicker
                                                        openTo="month"
                                                        views={['year', "month"]}
                                                        value={dayjs(entry[propertyName], 'MMMM YYYY').startOf('month')}
                                                        onChange={(e) => handleCellValueChange(rowIndex, propertyName, dayjs(e).format('MMMM YYYY'))}
                                                        slotProps={{ textField: { size: 'small' } }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                            "& .MuiOutlinedInput-input": {
                                                                fontSize: 14,
                                                                fontFamily: 'Roboto',
                                                                width: '100px',
                                                                fontWeight: 'light',
                                                                paddingTop: 0,
                                                                paddingLeft: 0,
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                paddingTop: 0, // Remove padding from the root element
                                                                paddingLeft: 0,
                                                            },
                                                        }}
                                                    />
                                                ) : (
                                                    <DatePicker
                                                        openTo="day"
                                                        views={['year', "month", "day"]}
                                                        value={dayjs(entry[propertyName], 'DD MMMM YYYY').startOf('day')}
                                                        onChange={(e) => handleCellValueChange(rowIndex, propertyName, dayjs(e).format('DD MMMM YYYY'))}
                                                        slotProps={{ textField: { size: 'small' } }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                            "& .MuiOutlinedInput-input": {
                                                                fontSize: 14,
                                                                fontFamily: 'Roboto',
                                                                width: '100px',
                                                                fontWeight: 'light',
                                                                paddingTop: 0,
                                                                paddingLeft: 0,
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                paddingTop: 0, // Remove padding from the root element
                                                                paddingLeft: 0,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </LocalizationProvider>
                                        ) : <textarea
                                            className='cell-textarea'
                                            value={entry[propertyName]}
                                            style={{ width: `${chToPx(propertyName.length) + (avgChars)}px` }}
                                            onChange={(e) => handleCellValueChange(rowIndex, propertyName, e.target.value)}
                                        />
                                        }
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                className="save-button"
                onClick={() => {
                    //handleSaveButtonClick();
                    setSaveConfirmation("Are you sure that you want to save your changes?");
                    setShowConfirm(true);
                }}
            >Save</button>
            {contextMenuData && cursorPosition && (
                <div
                    className="context-menu"
                    style={{ top: cursorPosition.top, left: cursorPosition.left }}
                >
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Clear cell')}>Clear cell</button>
                    <hr></hr>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Insert row above')}>Insert row above</button>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Insert row below')}>Insert row below</button>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Insert column to the right')}>Insert column to the right</button>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Insert column to the left')}>Insert column to the left</button>
                    <hr></hr>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Delete row')}>Delete row</button>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Delete column')}>Delete column</button>
                    <hr></hr>
                    <button className="context-menu-button" onClick={() => handleContextMenuAction('Edit column')}>Edit column</button>
                </div>
            )}
            {showAddColumnPopup && (
                <div className="disable-background">
                    <div className="popup">
                        <div className='align-popup-content'>
                            <h3>Insert Column</h3>
                            <input
                                type="text"
                                placeholder="Enter column name"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                            />
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newColMandatory}
                                        onChange={() => { setNewColMandatory(!newColMandatory) }}
                                    />
                                    Mandatory Field
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newColRepeatable}
                                        onChange={() => { setNewColRepeatable(!newColRepeatable) }}
                                        disabled={newColType === "dropdown" || newColType === "date" ? true : false}
                                    />
                                    Repeatable Field
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="text"
                                        checked={newColType === "text"}
                                        onChange={() => {
                                            setNewColType("text");
                                        }}
                                    />
                                    Text
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="dropdown"
                                        checked={newColType === "dropdown"}
                                        onChange={() => {
                                            setNewColType("dropdown");
                                            setNewColDropdownOption('');
                                            setNewColDropdownOptions([]);
                                            setNewColRepeatable(false);
                                        }}
                                    />
                                    Dropdown
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="filepath"
                                        checked={newColType === "filepath"}
                                        onChange={() => {
                                            setNewColType("filepath");
                                            setNewColFilePath("");
                                        }}
                                    />
                                    File Path
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="date"
                                        checked={newColType === "date"}
                                        onChange={() => {
                                            setNewColType("date");
                                            setNewColRepeatable(false);
                                        }}
                                    />
                                    Date
                                </label>
                            </div>
                            {newColType === "dropdown" && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter dropdown option"
                                        value={newColDropdownOption}
                                        onChange={(e) => setNewColDropdownOption(e.target.value)}
                                    />
                                    <p className='add-dropdown-option-button' onClick={handleAddDropdownOption}>Add Dropdown Option</p>
                                    <ul>
                                        {newColDropdownOptions.map((option, index) => (
                                            <li key={index}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '40%',
                                                    margin: '0 auto',
                                                }}>
                                                    <span>{option}</span>
                                                    <p className="delete-dropdown-options-button" onClick={() => handleDeleteDropdownOption(index)}>&times;</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {newColType === "filepath" && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter file path"
                                        value={newColFilePath}
                                        onChange={(e) => setNewColFilePath(e.target.value)}
                                    />
                                </div>
                            )}
                            {newColType === "date" && (
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="dateFormat"
                                            value="year"
                                            checked={newColDateFormat === "year"}
                                            onChange={() => {
                                                setNewColDateFormat("year");
                                            }}
                                        />
                                        YYYY
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="dateFormat"
                                            value="month"
                                            checked={newColDateFormat === "month"}
                                            onChange={() => {
                                                setNewColDateFormat("month");
                                            }}
                                        />
                                        MMMM YYYY
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="dateFormat"
                                            value="day"
                                            checked={newColDateFormat === "day"}
                                            onChange={() => {
                                                setNewColDateFormat("day");
                                            }}
                                        />
                                        DD MMMM YYYY
                                    </label>
                                </div>
                            )}
                            <div>
                                <button onClick={handleAddColumn}>Add Column</button>
                                <button onClick={() => {
                                    setShowAddColumnPopup(false);
                                    setNewColMandatory(false);
                                    setNewColRepeatable(false);
                                    setNewColType('text');
                                    setNewColDropdownOption('');
                                    setNewColDropdownOptions([]);
                                    setInsertColumnError('');
                                }}>Cancel</button>
                                <span className="close-button" onClick={() => {
                                    setShowAddColumnPopup(false);
                                    setNewColMandatory(false);
                                    setNewColRepeatable(false);
                                    setNewColType('text');
                                    setNewColDropdownOption('');
                                    setNewColDropdownOptions([]);
                                    setInsertColumnError('');
                                }}>&times;</span>
                            </div>
                            {insertColumnError !== "" && (
                                <label className="error-message">
                                    {insertColumnError}
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showEditColumnPopup && (
                <div className="disable-background">
                    <div className="popup">
                        <div className='align-popup-content'>
                            <h3>Edit Column</h3>
                            <input
                                type="text"
                                placeholder="Enter column name"
                                value={editColumnName}
                                onChange={(e) => {
                                    setEditColumnName(e.target.value);
                                }}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editColMandatory}
                                    onChange={() => {
                                        setEditColMandatory(!editColMandatory)
                                    }}
                                />
                                Mandatory Field
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editColRepeatable}
                                    onChange={() => {
                                        setEditColRepeatable(!editColRepeatable)
                                    }}
                                    disabled={editColType === "dropdown" || editColType === "date" ? true : false}
                                />
                                Repeatable Field
                            </label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="text"
                                        checked={editColType === "text"}
                                        onChange={() => {
                                            setEditColType("text");
                                        }}
                                    />
                                    Text
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="dropdown"
                                        checked={editColType === "dropdown"}
                                        onChange={() => {
                                            setEditColType("dropdown");
                                            setEditColDropdownOption('');
                                            setEditColDropdownOptions([]);
                                            setEditColRepeatable(false);
                                        }}
                                    />
                                    Dropdown
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="filepath"
                                        checked={editColType === "filepath"}
                                        onChange={() => {
                                            setEditColType("filepath");
                                            setEditColFilePath("");
                                        }}
                                    />
                                    File Path
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="columnType"
                                        value="date"
                                        checked={editColType === "date"}
                                        onChange={() => {
                                            setEditColType("date");
                                            setEditColDateFormat("year");
                                            setEditColRepeatable(false);
                                        }}
                                    />
                                    Date
                                </label>
                            </div>
                            {editColType === "dropdown" && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter dropdown option"
                                        value={editColDropdownOption}
                                        onChange={(e) => setEditColDropdownOption(e.target.value)}
                                    />
                                    <p className='add-dropdown-option-button' onClick={handleAddDropdownOptionEdit}>Add Dropdown Option</p>
                                    <ul>
                                        {editColDropdownOptions.map((option, index) => (
                                            <li key={index}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '40%',
                                                    margin: '0 auto',
                                                }}>
                                                    <span>{option}</span>
                                                    <p className="delete-dropdown-options-button" onClick={() => handleDeleteDropdownOptionEdit(index)}>&times;</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {editColType === "filepath" && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter file path"
                                        value={editColFilePath}
                                        onChange={(e) => {
                                            setEditColFilePath(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                            {editColType === "date" && (
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="dateFormat"
                                            value="year"
                                            checked={editColDateFormat === "year"}
                                            onChange={() => {
                                                setEditColDateFormat("year");
                                            }}
                                        />
                                        YYYY
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="dateFormat"
                                            value="month"
                                            checked={editColDateFormat === "month"}
                                            onChange={() => {
                                                setEditColDateFormat("month");
                                            }}
                                        />
                                        MMMM YYYY
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="dateFormat"
                                            value="day"
                                            checked={editColDateFormat === "day"}
                                            onChange={() => {
                                                setEditColDateFormat("day");
                                            }}
                                        />
                                        DD MMMM YYYY
                                    </label>
                                </div>
                            )}
                            <button onClick={() => {
                                handleEditColumn();
                            }}>Edit Column</button>
                            <button onClick={() => {
                                setShowEditColumnPopup(false);
                                setEditColMandatory(false);
                                setEditColRepeatable(false);
                                setEditColType("text");
                                setEditColDropdownOption("");
                                setEditColDropdownOptions([]);
                                setEditColDateFormat("year");
                                setEditColumnError("");
                            }}>Cancel</button>
                            <span className="close-button" onClick={() => {
                                setShowEditColumnPopup(false);
                                setEditColMandatory(false);
                                setEditColRepeatable(false);
                                setEditColType("text");
                                setEditColDropdownOption("");
                                setEditColDropdownOptions([]);
                                setEditColDateFormat("year");
                                setEditColumnError("");
                            }}>&times;</span>
                            <div>
                                {editColumnError !== "" && (
                                    <label className="error-message">
                                        {editColumnError}
                                    </label>
                                )}
                            </div>
                            <label className="confirm-message">
                                Note: Changing the column type will clear all the cells in the column
                            </label>
                        </div>
                    </div>
                </div>
            )}
            {showSelectFilePopup && (
                <div className="disable-background">
                    <div className="popup">
                        <div className='align-popup-content'>
                            <h3>Select Files</h3>
                        </div>
                        {filesFromPath.map((item, index) => (
                            <li key={index}>
                                <label>
                                    {clickedCellData && configData[clickedCellData.colIndex].repeatable === "true" && (
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(item)}
                                            onChange={() => {
                                                handleSelectedFilesChange(item, true);
                                                if (clickedCellData) {
                                                    console.log(configData[clickedCellData.colIndex].repeatable);
                                                }
                                            }}
                                        />
                                    )}
                                    {clickedCellData && configData[clickedCellData.colIndex].repeatable === "false" && (
                                        <input
                                            type="radio"
                                            checked={selectedFiles.includes(item)}
                                            onChange={() => {
                                                handleSelectedFilesChange(item, false);
                                                if (clickedCellData) {
                                                    console.log(configData[clickedCellData.colIndex].repeatable);
                                                }
                                            }}
                                        />
                                    )}
                                    {item}
                                </label>
                            </li>
                        ))}
                        <div className='align-popup-content'>
                            <button onClick={() => {
                                handleSelectedFiles();
                                setFilesFromPath([]);
                            }}>Select Files</button>
                            <button onClick={() => {
                                setShowSelectFilePopup(false);
                                setFilesFromPath([]);
                            }}>Cancel</button>
                        </div>
                        <span className="close-button" onClick={() => {
                            setShowSelectFilePopup(false);
                            setFilesFromPath([]);
                        }}>&times;</span>
                    </div>
                </div>
            )}
            {showError && (
                <div className="disable-background">
                    <div className="popup">
                        <div className='align-popup-content'>
                            <h3>Error!</h3>
                            {deleteColumnError !== "" && (
                                <label className="error-message">
                                    {deleteColumnError}
                                </label>
                            )}
                            {savingDataError !== "" && (
                                <label className="error-message">
                                    {savingDataError}
                                </label>
                            )}
                        </div>
                        <div className='align-popup-content' style={{ padding: 0 }}>
                            <button onClick={() => {
                                setDeleteColumnError("");
                                setSavingDataError("");
                                setShowError(false);
                            }}>Okay</button>
                        </div>
                        <span className="close-button" onClick={() => {
                            setDeleteColumnError("");
                            setSavingDataError("");
                            setShowError(false);
                        }}>&times;</span>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div className="disable-background">
                    <div className="popup">
                        <div className='align-popup-content'>
                            <h3>Success!</h3>
                            {savingSuccess !== "" && (
                                <label className="success-message">
                                    {savingSuccess}
                                </label>
                            )}
                        </div>
                        <div className='align-popup-content' style={{ padding: 0 }}>
                            <button onClick={() => {
                                setSavingSuccess("");
                                setShowSuccess(false);
                            }}>Okay</button>
                        </div>
                        <span className="close-button" onClick={() => {
                            setSavingSuccess("");
                            setShowSuccess(false);
                        }}>&times;</span>
                    </div>
                </div>
            )}
            {showConfirm && (
                <div className="disable-background">
                    <div className="popup">
                        <div className='align-popup-content'>
                            <h3>Confirmation</h3>
                            {deleteRowConfirmation !== "" && (
                                <label className="confirm-message">
                                    {deleteRowConfirmation}
                                </label>
                            )}
                            {deleteColConfirmation !== "" && (
                                <label className="confirm-message">
                                    {deleteColConfirmation}
                                </label>
                            )}
                            {saveConfirmation !== "" && (
                                <label className="confirm-message">
                                    {saveConfirmation}
                                </label>
                            )}
                        </div>
                        <div className='align-popup-content' style={{ padding: 0 }}>
                            {deleteRowConfirmation !== "" && (
                                <button onClick={() => {
                                    handleDeleteRow();
                                    setDeleteRowConfirmation("");
                                    setShowConfirm(false);
                                }}>Yes</button>
                            )}
                            {deleteColConfirmation !== "" && (
                                <button onClick={() => {
                                    handleDeleteCol();
                                    setDeleteColConfirmation("");
                                    setShowConfirm(false);
                                }}>Yes</button>
                            )}
                            {saveConfirmation !== "" && (
                                <button onClick={() => {
                                    handleSaveButtonClick();
                                    setSaveConfirmation("");
                                    setShowConfirm(false);
                                }}>Yes</button>
                            )}
                            <button onClick={() => {
                                setDeleteRowConfirmation("");
                                setDeleteColConfirmation("");
                                setSaveConfirmation("");
                                setShowConfirm(false);
                            }}>Cancel</button>
                        </div>
                        <span className="close-button" onClick={() => {
                            setDeleteRowConfirmation("");
                            setDeleteColConfirmation("");
                            setSaveConfirmation("");
                            setShowConfirm(false);
                        }}>&times;</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CSVTable;