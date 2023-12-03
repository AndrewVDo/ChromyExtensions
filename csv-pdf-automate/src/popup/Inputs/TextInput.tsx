import * as React from 'react';
import { useState } from 'react';
import { ParseResult } from 'papaparse';
import { readString } from 'react-papaparse';
import { Switch } from '@mui/base/Switch';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { DataGrid } from '@mui/x-data-grid';
import './TextInput.css';


function TextInput() {
    const [hasColumnNames, setHasColumnNames] = useState(false);
    const [rawText, setRawText] = useState('');
    const [records, setRecords] = useState<ParseResult<unknown>>();


    // Helper Functions-----------------------------------------------------------------------
    function readRawText(rawText: string, hasColumnNames: boolean) {
        readString(rawText, {
            header: hasColumnNames,
            worker: true,
            complete: (results) => {
                setRecords(results);
        }});
    }

    interface DGRecord {
        id: number, // required
        [key: string]: any
    }

    function getRows() {
        if (!records?.data) {
            return [];
        }

        const fields = getFields();
        console.log(fields);

        let result = [];
        for (let i=0; i<records?.data.length; i++) {
            let record = records?.data[i] as DGRecord;

            if (Array.isArray(record) && !hasColumnNames) {
                const recordAsObj = record.reduce((result, item, index) => {
                    if (fields[index] && !Object.hasOwn(fields[index], 'field')) {
                        return result;
                    }
                    const fieldName = fields[index]['field']; 
                    result[fieldName] = item;
                    return result;
                }, {} as DGRecord);
                recordAsObj['id'] = i;
                result.push(recordAsObj);

            } else if (record && typeof record === "object" && hasColumnNames) {
                if (!Object.hasOwn(record, 'id')) {
                    record['id'] = i;
                }
                result.push(record);
            }
        }

        console.log(result)
        return result;
    }

    interface DGField {
        field: string,
        headerName: string,
        width: number
    }

    function getFields() {
        let fields = [] as DGField[];

        let fieldNames = [] as string[];
        if (!hasColumnNames || records?.meta.fields) {
            const delimiter = records?.meta.delimiter
            const firstLine = rawText.split('\n')[0];
            if (firstLine && delimiter) {
                for (let i=0; i<firstLine.split(delimiter).length; i++) {
                    fieldNames.push("column_" + i)
                }
            }
        } else {
            fieldNames = records?.meta.fields;
        }

        for (let fieldName in fieldNames) {
            let dgField = {} as DGField;
            dgField['field'] = fieldName.replace(/ /g, '_');
            dgField['headerName'] = fieldName;
            dgField['width'] = 150;
            fields.push(dgField);
        }

        return fields;
    }
    // Helper Functions


    // Change Handlers----------------------------------------------------------------------
    function handleCsvChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const newRawText = event.target.value;
        setRawText(newRawText);
        readRawText(newRawText, hasColumnNames);
    }


    function handleHasColumnNamesChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newHasColumnNames = event.target.checked;
        setHasColumnNames(newHasColumnNames);
        readRawText(rawText, newHasColumnNames);
    }
    // Change Handlers-----------------------------------------------------------------------


    return (
        <div className='Text'>
            <TextareaAutosize
                minRows={3}
                maxRows={3}
                placeholder="Paste spreadsheet data here."
                onChange={handleCsvChange}
            />
            <br></br>
            <label>Column names in first row: </label>
            <Switch
                checked={hasColumnNames}
                onChange={handleHasColumnNamesChange}
            />
            <DataGrid
                rows={getRows()}
                columns={getFields()}
            />
        </div>
    )
}

export default TextInput