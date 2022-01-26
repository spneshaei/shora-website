import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Card, Typography, IconButton } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import { hasAccess } from '../../Helpers/UserHelper';
import deleteLostAndFound from "../../AxiosCalls/LostAndFound/deleteLostAndFound"
import returnLostAndFound from "../../AxiosCalls/LostAndFound/returnLostAndFound"


const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'name',
        headerName: 'شی پیدا شده',
        width: 150,
    },
    {
        field: 'found_in',
        headerName: 'مکان پیدا شدن',
        width: 150,
    },
    {
        field: 'found_at',
        headerName: 'زمان پیدا شدن',
        width: 150,
    },
];

export default function LostAndFoundGrid({ found, onRowDeleted }) {

    const actionsColumn = {
        field: 'actions',
        headerName: 'عملیات',
        with: 150,
        renderCell: (params) => (
            <div>
                <IconButton color="success" onClick={() => {
                    returnLostAndFound(params.row.id, () => {
                        onRowDeleted(params.row.id)
                    }, () => {});
                }}>
                    <DoneIcon />
                </IconButton>
                <IconButton color="error" onClick={() => {
                    deleteLostAndFound(params.row.id, () => {
                        onRowDeleted(params.row.id)
                    }, () => {})
                }}>
                    <ClearIcon />
                </IconButton>
            </div>
        ),
    }

    if (hasAccess(['owner', 'financial', 'admin']))
        columns.push(actionsColumn);

    return (
        <Card variant="outlined" sx={{ padding: 2, margin: 2, height: '100%' }}>
            <Typography variant="h5" mb={2}>
                اشیاء پیدا شده
            </Typography>
            <DataGrid
                rows={found ? found : []}
                autoHeight={true}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
            />
        </Card>
    );
}
