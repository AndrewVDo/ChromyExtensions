import * as React from 'react';

import Box from '@mui/material/Box';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import './ImageUploadPreview.css'

interface ImageUploadPreviewProps {
    height: string;
    imageTemplate: string | undefined;
    setImageTemplate: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ImageUploadPreview: React.FunctionComponent<ImageUploadPreviewProps> = ({ height, imageTemplate, setImageTemplate }) => {
    if (imageTemplate == undefined) {
        return (
            <Box
                sx={{
                    height: height
                }}>
                <Box
                    // className='image-upload-preview'
                    component='input'
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-input"
                    type="file"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        if (!event.target || !event.target.files) {
                            return;
                        } else if (event.target.files.length > 1) {
                            console.warn(`${ImageUploadPreview.name} unexpectedly uncountered multiple files ${event.target.files}`);
                        } else if (event.target.files.length == 1) {
                            setImageTemplate(URL.createObjectURL(event.target.files[0]));
                        } else {
                            setImageTemplate(undefined);
                        }
                    }}
                />
                <label htmlFor='image-input'>
                    <Grid
                        sx={{
                            height: height
                        }}
                        className='image-upload-preview'
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Grid>
                            <CloudUploadIcon
                                sx={{
                                    transform: 'scale(2)'
                                }}
                            />
                        </Grid>
                        <Grid>
                            <p>Upload Document Template</p>
                        </Grid>
                    </Grid>
                </label>
            </Box>
        )
    } else {
        return (
            <Box
                sx={{
                    height: height,
                    'object-fit': 'cover'
                }}
                className='image-upload-preview-img'
                component='img'
                src={imageTemplate}
                onClick={() => {
                    setImageTemplate(undefined);
                }}
            />
        )
    }
}

export default ImageUploadPreview