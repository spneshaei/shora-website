import * as React from 'react'
import DemandItem from "../Components/Demands/DemandItem"
import AddDemandForm from "../Components/Demands/AddDemandForm"
import getDemands from '../AxiosCalls/Demands/getDemands'
import getSingleDemand from '../AxiosCalls/Demands/getSingleDemand'
import likeDemand from '../AxiosCalls/Demands/likeDemand'
import unlikeDemand from '../AxiosCalls/Demands/unlikeDemand'
import banUser from '../AxiosCalls/Demands/banUser'
import changeDemandStatus from '../AxiosCalls/Demands/changeDemandStatus'
import deleteDemand from '../AxiosCalls/Demands/deleteDemand'
import { Masonry } from '@mui/lab';
import { Alert, ImageList, ImageListItem, Backdrop, CircularProgress, Dialog, Fab, Grid, Pagination, Snackbar, Paper, IconButton, InputBase, Divider, Menu, MenuItem, AlertTitle, Collapse, Autocomplete, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add'
import { Box } from '@mui/system'
import { useParams } from "react-router-dom";
import getDemandCategories from '../AxiosCalls/DemandCategories/getDemandCategories'
import { useRecoilState } from 'recoil'
import { demandCategoryAtom } from '../Atoms/demandCategoryAtom'
import { ListItemIcon } from '@mui/material';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default function DemandsPage({setSelectedItem}) {

    const { id } = useParams();

    const showSingleDemand = id && !isNaN(id);

    const allCategories = { id: 0, name: "همه‌ی درخواست‌ها" };

    const [demands, setDemands] = React.useState([])
    const [demandsCategories, setDemandsCategories] = useRecoilState(demandCategoryAtom)
    const [selectedCategory, setSelectedCategory] = React.useState(allCategories.id)
    const [singleDemand, setSingleDemand] = React.useState();
    const [pageData, setPageData] = React.useState({
        currentPage: 1,
        lastPage: 1,
        isLoading: true,
    });
    const [toSearch, setToSearch] = React.useState('')
    const [loading, setLoading] = React.useState([])
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [likeDialogOpen, setLikeDialogOpen] = React.useState(false)
    const [isSnackbarOpen, setSnackbarOpen] = React.useState(false);
    const [popupData, setPopUpData] = React.useState({
        open: false,
        message: '',
        color: 'success',
    })
    const [warningOpen, setWarningOpen] = React.useState(true);

    const getDemandsOfPage = (page, search) => {
        let resdata = JSON.parse(localStorage.getItem("resdata"));
        if (resdata != undefined && resdata != null) {
            setPageData({
                currentPage: page,
                lastPage: resdata.last_page,
                isLoading: false,
            })
            setDemands(resdata.demands)
            document.body.style.overflow = 'auto';    
        }
        
        getDemands({ page: page, search: search, category_id: selectedCategory }, (res) => {
            setPageData({
                currentPage: page,
                lastPage: res.data.last_page,
                isLoading: false,
            })
            setDemands(res.data.demands)
            document.body.style.overflow = 'auto';
            localStorage.setItem("resdata", JSON.stringify(res.data));
        }, () => { })
    }

    const changePage = (event, value) => {
        setDemands([])
        setPageData({ ...pageData, currentPage: value, isLoading: true })
        getDemandsOfPage(value)
    }

    const toggleLikedInDemand = (id) => {
        let changedDemands = demands.map((item) => {
            let newItem = { ...item }
            if (newItem.id === id) {
                newItem.is_liked = !newItem.is_liked;
                newItem.likes_count += newItem.is_liked ? 1 : -1;
            }
            return newItem;
        })
        setDemands(changedDemands)
    }

    const showPopUp = (message, isSuccess) => {
        setPopUpData({
            open: true,
            message: message,
            color: isSuccess ? 'success' : 'error',
        });
    }

    const demandActionsGenerator = (demand) => {
        const onLike = () => {
            const toCall = demand.is_liked ? unlikeDemand : likeDemand;
            setLoading([...loading, demand.id])
            toCall(demand.id, () => {
                toggleLikedInDemand(demand.id)
                setLoading(loading.filter((id) => id !== demand.id))
            }, () => { })
        }

        const onBan = () => {
            banUser(
                demand.id,
                (res) => showPopUp('کاربر با موفقیت مسدود شد', true),
                (err) => showPopUp(err, false)
            )
        }

        const onDelete = () => {
            deleteDemand(
                demand.id,
                () => {
                    showPopUp('با موفقیت حذف شد', true)
                    setDemands(demands.filter(item => item.id !== demand.id))
                },
                (err) => showPopUp(err, false))
        }

        const onChangeStatus = (selected) => {
            changeDemandStatus({
                demand_id: demand.id,
                status: selected
            }, () => {
                showPopUp('با موفقیت انجام شد', true)
                setDemands(demands.map(item => {
                    if (item.id === demand.id)
                        return { ...item, status: selected }
                    return item
                }))
            }, (err) => showPopUp(err, false))
        }

        return { onBan, onDelete, onLike, onChangeStatus }
    }

    React.useEffect(() => {
        if (setSelectedItem) setSelectedItem('درخواست‌ها');
        if (showSingleDemand)
            getSingleDemand(id, (res) => {
                setSingleDemand(res.data.demand);
                document.body.style.overflow = 'auto';
            }, () => { })
        getDemandCategories(() => { }, () => { })
    }, []);

    React.useEffect(() => {
        let myWebSocket = new WebSocket("ws://localhost:9091");
        myWebSocket.onmessage = function(evt) {
            getDemandCategories(() => { }, () => { });
            setSnackbarOpen(true);
        };
    });

    React.useEffect(() => {
        changePage(1)
    }, [selectedCategory])

    const filteredDemands = () => {
        return demands.filter(demand => {
            if (toSearch == '') return true;
            if (demand["category"].toLowerCase().includes(toSearch.toLowerCase())) return true;
            if (demand["body"].toLowerCase().includes(toSearch.toLowerCase())) return true;
            return false;
        })
    } 

    return (
        <>
        <ReactCSSTransitionGroup
        transitionAppear={true}
        transitionAppearTimeout={600}
        transitionEnterTimeout={600}
        transitionLeaveTimeout={200}
        transitionName={'SlideIn'}
        >
        
        <Box>
            <Dialog
                dir='rtl'
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth={true}
                maxWidth='md'>
                <AddDemandForm
                    onDemandAdded={(added) => {
                        setDemands([added, ...demands])
                        setDialogOpen(false);
                    }} />
            </Dialog>
            <Dialog
                dir='rtl'
                open={likeDialogOpen}
                onClose={() => setLikeDialogOpen(false)}
                fullWidth={true}
                maxWidth='md'>
                &nbsp;
            </Dialog>
            <Grid container alignContent='center' sx={{ mb: 2 }} spacing={2}>
                <Grid item xs={6} sm={6} md={6}>
                    <Paper
                        variant='outlined'
                        sx={{ p: '5px 4px', display: 'flex', alignItems: 'center', width: '100%'}}
                        className={"demand-card-bg"}>
                        <InputBase
                            onChange={(e) => setToSearch(e.target.value)}
                            value={toSearch}
                            sx={{ mr: 1, flex: 1 }}
                            placeholder="جست‌وجو"
                            inputProps={{ 'aria-label': 'جست‌وجو' }} />
                        <IconButton
                            sx={{ p: '10px' }}
                            onClick={() => {
                                getDemandsOfPage(1, toSearch)
                            }}>
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <TextField
                        value={selectedCategory}
                        sx={{ width: '100%' }}
                        className={"demand-card-bg"}
                        select
                        onChange={(e) => {setSelectedCategory(e.target.value)}} >
                        {[allCategories, ...demandsCategories].map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
            {showSingleDemand && singleDemand &&
                <div>
                    <DemandItem
                        variant='elevation'
                        sx={{ background: '#42a5f515' }}
                        key={singleDemand.id}
                        demand={singleDemand}
                        loading={loading.includes(singleDemand.id)}
                        onBanClicked={demandActionsGenerator(singleDemand).onBan}
                        onChangeStatusClicked={demandActionsGenerator(singleDemand).onChangeStatus}
                        onDeleteClicked={demandActionsGenerator(singleDemand).onDelete}
                        onLikeClicked={demandActionsGenerator(singleDemand).onLike} />
                    <Divider sx={{ my: 2 }}> <span style={{fontColor: 'white', fontSize: 25}}>
                        سایر درخواست‌ها
                        </span></Divider>
                </div>
            }
            <Grid container justifyContent="center">
                {pageData.lastPage !== 1 &&
                    <Pagination count={pageData.lastPage} onChange={changePage} size="large" shape="rounded" sx={{ marginBottom: 2 }} />}
            </Grid>

            <div style={{marginLeft: -15}}>
            <Masonry dir="rtl" columns={{ xs: 1, sm: 1, md: 2, xxl: 4 }} spacing={2}>
                {filteredDemands().map((demand) => {
                    const { onBan, onDelete, onLike, onChangeStatus } = demandActionsGenerator(demand)
                    return (
                        <ImageListItem key={demand.id} sx={{width: '100%'}}>
                            <DemandItem  dir={"rtl"}
                                key={demand.id}
                                demand={demand}
                                loading={loading.includes(demand.id)}
                                onBanClicked={onBan}
                                onChangeStatusClicked={onChangeStatus}
                                onDeleteClicked={onDelete}
                                onLikeClicked={onLike} />
                        </ImageListItem>
                    )
                })}
            </Masonry>
            </div>
            <Snackbar
                open={popupData.open}
                autoHideDuration={15000}
                onClose={() => setPopUpData({ ...popupData, open: false })}>
                <Alert
                    severity={popupData.color}
                    sx={{ width: '100%' }}>
                    {popupData.message}
                </Alert>
            </Snackbar>

            
            {/* <Backdrop
                invisible={true}
                open={pageData.isLoading}>
                <CircularProgress color="primary" />
            </Backdrop> */}
        </Box>
        
        
        </ReactCSSTransitionGroup>

        <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
            <span dir="ltr"><Alert onClose={() => setSnackbarOpen(false)} severity={"info"}>
                درخواست جدیدی ثبت شده است
            </Alert></span>
        </Snackbar>

        <Fab
                sx={{
                    margin: 1,
                    position: "fixed",
                    bottom: 8,
                    left: 8
                }}
                onClick={() => setDialogOpen(true)}
                variant='extended'
                color='primary'>
                    <AddIcon sx={{ ml: 1 }} />
                افزودن درخواست
                
        </Fab>
        </>
    )
}