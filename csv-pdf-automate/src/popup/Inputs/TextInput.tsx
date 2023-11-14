import * as React from 'react';
import { useState } from 'react'
import { parse } from 'csv-parse/sync';
import { Switch } from '@mui/base/Switch';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { DataGrid } from '@mui/x-data-grid';



function detectCsvDelimiter(csvString: string) {
    const potentialDelimiters = [',', ';', '\t'];
    const delimiterCounts = potentialDelimiters.map(delimiter => {
        const lines = csvString.split('\n').slice(0, 5);
        const count = lines.reduce((acc, line) => acc + line.split(delimiter).length - 1, 0);
        return { delimiter, count };
    });
    const sortedDelimiters = delimiterCounts.sort((a, b) => b.count - a.count);
    return sortedDelimiters[0].delimiter;
}


// function TextPreview({ records: any[] }) {
//     const columnNames = records[0]

//     return (
//         <DataGrid
//             rows={records}
//         />
//     )
// }


function TextInput() {
    const [csvData, setCsvData] = useState('');
    const [hasColumnNames, setHasColumnNames] = useState(false);

    let detectedDelimiter = detectCsvDelimiter(csvData);
    let records = parse(csvData, { columns: hasColumnNames })

    function handleCsvChange(event: object) {
        setCsvData(event.target.value)
    }

    function handleHasColumnNamesChange(event: object) {
        setHasColumnNames(event.target.value)
    }

    return (
        <div className='Text'>
            <TextareaAutosize
                minRows={3}
                maxRows={3}
                placeholder="Paste spreadsheet data here."
                onChange={handleCsvChange}
            />
            <label>Column names in first row: </label>
            <Switch
                checked={hasColumnNames}
                onChange={handleHasColumnNamesChange}
            />
            <DataGrid
                rows={records}
            />
            {/* <TextPreview
                records={records}
            /> */}
        </div>
    )
}

export default TextInput