import { FormControl, Select, FormHelperText, SelectChangeEvent, MenuItem } from "@mui/material"
import React from "react"
import "./controlsStyles.css"

type TimeIntervalSelectProps = {
    interval: string | null,
    availableIntervals: string[],
    onChange: (interval: string) => void
}

export const TimeIntervalSelect: React.FC<TimeIntervalSelectProps> = (props) => {

    const { interval, availableIntervals, onChange } = props

    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value);
      };

    return (
        <div className="time-interval-select-container">
            <FormControl sx={{ m: 0, p: 0, minWidth: 80 }} size="small">
            <Select
                value={interval ?? ''}
                onChange={handleChange}
                displayEmpty
                MenuProps={{ classes: { paper: 'time-interval-select-menu' }, variant: 'menu' }}
                inputProps={{ 'aria-label': 'Without label' }}
                sx={{ color: 'white', backgroundColor: '#393b60' }}
            >
                {availableIntervals.map((interval) => (
                    <MenuItem value={interval}>{interval}</MenuItem>
                ))}
            </Select>
        </FormControl>
      </div>
    )
}