import * as React from 'react';
import { useState } from 'react';
import { ParseResult } from 'papaparse';
import { readString } from 'react-papaparse';

import TextField from '@mui/material/TextField';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';



import './TextInput.css';


function TextInput() {
    const [tabIndex, setTabIndex] = useState('1');
    const [hasColumnNames, setHasColumnNames] = useState('true');
    const [rawText, setRawText] = useState('');
    const [records, setRecords] = useState<ParseResult<unknown>>();
    const [delimiter, setDelimiter] = useState('auto');
    const [imageTemplate, setImageTemplate] = useState<File|null>(null);


    // Helper Functions-----------------------------------------------------------------------
    function readRawText(rawText: string, hasColumnNames: boolean) {
        readString(rawText, {
            header: hasColumnNames,
            worker: true,
            complete: (results) => {
                setRecords(results);
        }});
    }

    function delayedSetTabIndex(delayTime: number) {
        delayTime = Math.min(10000, delayTime);
        delayTime = Math.max(1000, delayTime);
        setTimeout(() => {
            setTabIndex("2");
        }, delayTime);
    }

    function hasColumnNamesAsBool() {
        return hasColumnNames == "true" ? true : false;
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

        let result = [];
        for (let i=0; i<records?.data.length; i++) {
            let record = records?.data[i] as DGRecord;

            if (Array.isArray(record) && !hasColumnNamesAsBool()) {
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

            } else if (record && typeof record === "object" && hasColumnNamesAsBool()) {
                if (!Object.hasOwn(record, 'id')) {
                    record['id'] = i;
                }
                result.push(record);
            }
        }

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
        if (!hasColumnNamesAsBool() || !records?.meta.fields) {
            var finalDelimiter;
            if (delimiter == "auto") {
                finalDelimiter = records?.meta.delimiter;
            } else {
                finalDelimiter = delimiter;
            }
            const firstLine = rawText.split('\n')[0];
            if (firstLine && finalDelimiter) {
                for (let i=0; i<firstLine.split(finalDelimiter).length; i++) {
                    fieldNames.push("column_" + i)
                }
            }
        } else {
            fieldNames = records?.meta.fields;
        }

        for (let i=0; i<fieldNames.length; i++) {
            let fieldName = fieldNames[i];
            let dgField = {} as DGField;
            dgField['field'] = fieldName.replace(/ /g, '_');
            dgField['headerName'] = fieldName;
            dgField['width'] = 100;
            fields.push(dgField);
        }

        return fields;
    }
    // Helper Functions


    // Change Handlers----------------------------------------------------------------------
    function handleCsvChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const newRawText = event.target.value;
        setRawText(newRawText);
        readRawText(newRawText, hasColumnNamesAsBool());
    }

    function handleDetectColumnNamesChange(event: SelectChangeEvent) {
        const newHasColumnNames = event.target.value;
        const newHasColumnNamesAsBool = event.target.value as string == "true" ? true : false;
        setHasColumnNames(newHasColumnNames);
        readRawText(rawText, newHasColumnNamesAsBool);
    }

    function handleTabChange(event: React.SyntheticEvent, newValue: string) {
        setTabIndex(newValue);
    }

    function handleDelimiterChange(event: SelectChangeEvent) {
        setDelimiter(event.target.value as string);
    }

    function handleClear() {
        setRawText('');
        readRawText('', hasColumnNamesAsBool());
    }

    function handleFormat() {
        setTabIndex('2');
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target || !event.target.files) {
            return;
        } else if (event.target.files.length > 1) {
            console.warn(`${handleImageUpload.name} unexpectedly uncountered multiple files ${event.target.files}`);
        } else if (event.target.files.length == 1) {
            setImageTemplate(event.target.files[0]);
        } else {
            setImageTemplate(null);
        }
    }
    // Change Handlers-----------------------------------------------------------------------


    return (
        <div className='Text'>
            <Box sx={{ width: '100%', height: '325px'}}>
                <TabContext value={tabIndex}>
                    <Box sx={{ borderBottom: 1 }}>
                        <TabList onChange={handleTabChange}>
                            <Tab label="Raw Data Input" value="1" />
                            <Tab label="Formatted Data" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <FormControl sx={{ m: 1, minWidth: 360 }}>
                            <InputLabel id="detect-column-names-label">Detect column names</InputLabel>
                            <Select
                                labelId="detect-column-names-label"
                                id="detect-column-names"
                                value={hasColumnNames}
                                label="Detect column names"
                                onChange={handleDetectColumnNamesChange}
                            >
                                <MenuItem value={'true'}>On</MenuItem>
                                <MenuItem value={'false'}>Off</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 360 }}>
                            <InputLabel id="force-select-delimiter-label">Delimiter</InputLabel>
                            <Select
                                labelId="force-select-delimiter-label"
                                id="force-select-delimiter"
                                value={delimiter}
                                label="Delimiter"
                                onChange={handleDelimiterChange}
                            >
                                <MenuItem value={'auto'}>Auto</MenuItem>
                                <MenuItem value={','}>Comma</MenuItem>
                                <MenuItem value={'\t'}>Tab</MenuItem>
                                <MenuItem value={':'}>Colon</MenuItem>
                                <MenuItem value={';'}>Semicolon</MenuItem>
                            </Select>
                        </FormControl>
                        <input accept="image/*" style={{ display: 'none' }} id="image-input" type="file" onChange={handleImageUpload}></input>
                        <label htmlFor='image-input'>
                            <Button component="span" variant="contained" startIcon={<CloudUploadIcon />}>
                                Upload File
                            </Button>
                        </label>
                        <TextField
                            label="CSV Input"
                            multiline
                            fullWidth
                            rows={4}
                            placeholder="Paste spreadsheet data here."
                            onChange={handleCsvChange}
                            value={rawText}
                        />
                        <Button variant="outlined" onClick={handleClear}>Clear</Button>
                        <Button variant="contained" onClick={handleFormat}>Format</Button>

                    </TabPanel>
                    <TabPanel value="2">
                        <DataGrid
                            rows={getRows()}
                            columns={getFields()}
                            initialState={{
                                pagination: {
                                paginationModel: {
                                    pageSize: 2,
                                },
                                },
                            }}
                            pageSizeOptions={[2]}
                        />
                    </TabPanel>
                </TabContext>
            </Box>
        </div>
    )
}

export default TextInput