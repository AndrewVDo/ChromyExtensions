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
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';


import './TextInput.css';
import ImageUploadPreview from './ImageUploadPreview';


function TextInput() {
    const [tabIndex, setTabIndex] = useState('1');
    const [hasColumnNames, setHasColumnNames] = useState('true');
    const [rawText, setRawText] = useState('');
    const [records, setRecords] = useState<ParseResult<unknown>>();
    const [delimiter, setDelimiter] = useState('auto');
    const [imageTemplate, setImageTemplate] = useState<string | undefined>(undefined);

    // Helper Functions-----------------------------------------------------------------------
    function readRawText(rawText: string, hasColumnNames: boolean) {
        readString(rawText, {
            header: hasColumnNames,
            worker: true,
            complete: (results) => {
                setRecords(results);
            }
        });
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
        for (let i = 0; i < records?.data.length; i++) {
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
                for (let i = 0; i < firstLine.split(finalDelimiter).length; i++) {
                    fieldNames.push("column_" + i)
                }
            }
        } else {
            fieldNames = records?.meta.fields;
        }

        for (let i = 0; i < fieldNames.length; i++) {
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

    function handleDetectColumnNamesChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newHasColumnNames = event.target.value;
        const newHasColumnNamesAsBool = event.target.value as string == "true" ? true : false;
        setHasColumnNames(newHasColumnNames);
        readRawText(rawText, newHasColumnNamesAsBool);
    }

    function handleTabChange(event: React.SyntheticEvent, newValue: string) {
        setTabIndex(newValue);
    }

    function handleDelimiterChange(event: React.ChangeEvent<HTMLInputElement>) {
        setDelimiter(event.target.value as string);
    }

    function handleClear() {
        setRawText('');
        readRawText('', hasColumnNamesAsBool());
        setImageTemplate(undefined);
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
            setImageTemplate(URL.createObjectURL(event.target.files[0]));
        } else {
            setImageTemplate(undefined);
        }
    }
    // Change Handlers-----------------------------------------------------------------------


    return (
        <div className='Text'>
            <Box sx={{ width: '100%', height: '595px' }}>
                <TabContext value={tabIndex}>
                    <Box sx={{ borderBottom: 1 }}>
                        <TabList onChange={handleTabChange}>
                            <Tab label="Data Input" value="1" />
                            <Tab label="Data Preview" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <Grid container spacing={2}>
                            <Grid xs={3}>
                                <Grid container direction="column" spacing={2}>
                                    <Grid>
                                        <FormControl>
                                            <FormLabel id="radio-group-has-header">Detect column names</FormLabel>
                                            <RadioGroup
                                                aria-labelledby="radio-group-has-header"
                                                value={hasColumnNames}
                                                defaultValue={'true'}
                                                onChange={handleDetectColumnNamesChange}
                                            >
                                                <FormControlLabel control={<Radio />} value={'true'} label="On" />
                                                <FormControlLabel control={<Radio />} value={'false'} label="Off" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>

                                    <Grid>
                                        <FormControl>
                                            <FormLabel id="radio-group-delimiter">Column delimiter</FormLabel>
                                            <RadioGroup
                                                aria-labelledby="radio-group-delimiter"
                                                value={delimiter}
                                                defaultValue={'auto'}
                                                onChange={handleDelimiterChange}
                                            >
                                                <FormControlLabel control={<Radio />} value={'auto'} label="Auto" />
                                                <FormControlLabel control={<Radio />} value={','} label="," />
                                                <FormControlLabel control={<Radio />} value={'\t'} label="\t" />
                                                <FormControlLabel control={<Radio />} value={':'} label=":" />
                                                <FormControlLabel control={<Radio />} value={';'} label=";" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid xs={9}>

                                <Grid container direction="column" spacing={2} sx={{ height: '500px' }}>
                                    <Grid xs={5}>
                                        <ImageUploadPreview
                                            height='230px'
                                            imageTemplate={imageTemplate}
                                            setImageTemplate={setImageTemplate}
                                        />
                                    </Grid>

                                    <Grid xs={6}>
                                        <TextField
                                            label="CSV Input"
                                            multiline
                                            fullWidth
                                            rows={6}
                                            placeholder="Paste spreadsheet data here."
                                            onChange={handleCsvChange}
                                            value={rawText}
                                        />
                                    </Grid>

                                    <Grid xs={1}>
                                        <Grid container direction="row-reverse" spacing={2}>
                                            <Grid>
                                                <Button variant="contained" onClick={handleFormat}>Format</Button>
                                            </Grid>

                                            <Grid>
                                                <Button variant="outlined" onClick={handleClear}>Clear</Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value="2">
                        <Grid container spacing={2} sx={{ width: '100%' }}>
                            <Grid xs={12}>
                                <DataGrid
                                    rows={getRows()}
                                    columns={getFields()}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 1,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[1]}
                                />
                            </Grid>

                            <Grid xs={12}>
                                <Box
                                    component="img"
                                    sx={{
                                        width: 595,
                                        maxHeight: { xs: 300, md: 300 },
                                        maxWidth: { xs: 595, md: 595 },
                                        'object-fit': 'cover'
                                    }}
                                    src={imageTemplate}
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>
                </TabContext>
            </Box>
        </div >
    )
}

export default TextInput