import { Button, TextField } from "@mui/material";
import React, { useState } from "react"
import { PartialTakeProfitProps } from "./positionManager.interfaces";

const PartialTakeProfit: React.FC<PartialTakeProfitProps> = (props) => {
    const {
        disabled,
        handlePartialTP
    } = props
    const [ptpPercentage, setPtpPercentage] = useState<number>(1);
    const [customPercentage, setCustomPercentage] = useState<boolean>(false);

    const buttonStyles = {
        color: 'white',
        fontSize: '11px',
        border: '1px solid #1e1e31',
        padding: '2px',
        backgroundColor: '#40425d',
    }

    return (
        <>
            <div className="customManager table--cell"
                onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}>
                <Button
                    disabled={disabled}
                    onClick={() => handlePartialTP(10)}
                    sx={{ minWidth: 'auto', ...buttonStyles }}>
                    10%
                </Button>
                <Button
                    disabled={disabled}
                    onClick={() => handlePartialTP(20)}
                    sx={{ minWidth: 'auto', ...buttonStyles }}>
                    20%
                </Button>
                <Button
                    disabled={disabled}
                    onClick={() => handlePartialTP(50)}
                    sx={{ minWidth: 'auto', ...buttonStyles }}>
                    50%
                </Button>
                <Button
                    disabled={disabled}
                    onClick={() => handlePartialTP(90)}
                    sx={{ minWidth: 'auto', ...buttonStyles }}>
                    90%
                </Button>
                <Button
                    disabled={disabled}
                    onClick={() => handlePartialTP(100)}
                    sx={{ minWidth: 'auto', ...buttonStyles }}>
                    ALL
                </Button>
                <Button
                    disabled={disabled}
                    onClick={() => setCustomPercentage(!customPercentage)}
                    sx={{ minWidth: 'auto', ...buttonStyles }}>
                    Custom
                </Button>
                {customPercentage &&
                    <>
                        <TextField
                            type="number"
                            value={ptpPercentage}
                            onChange={(event) => setPtpPercentage(Number(event.target.value))}

                            inputProps={{
                                step: 1,
                                min: 1,
                                max: 100
                            }}
                            sx={{
                                marginLeft: '5px',
                                minWidth: '50px',
                                color: 'white',
                                fontSize: '11px',
                                padding: '0px 4px',
                                '&>.MuiInputBase-colorPrimary': {
                                    color: 'white',
                                },
                                '& .MuiInputBase-input': {
                                    backgroundColor: '#252637',
                                    padding: '3px 5px'
                                }
                            }}
                        />
                        <span>%</span>
                        <Button
                            disabled={disabled}
                            onClick={() => handlePartialTP(ptpPercentage)}
                            sx={{ minWidth: 'auto', ...buttonStyles }}>
                            Close
                        </Button>
                    </>
                }
            </div>
        </>
    )
}

export default PartialTakeProfit;