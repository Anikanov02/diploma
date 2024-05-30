import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup/ToggleButtonGroup";
import React from "react";

type ToggleOptionProps = {
    options: string[]
    option: string | null
    onSetOption: (option: string) => void
}

export const ToggleOption = (props: ToggleOptionProps) => {
    const { options, option, onSetOption } = props;

    const handleOption = (
        event: React.MouseEvent<HTMLElement>,
        newOption: string,
      ) => {
        onSetOption(newOption);
      };

    return (
        <ToggleButtonGroup
            size="small"
            value={option}
            exclusive
            onChange={handleOption}
            aria-label="setting toggle"
        >
            {options.map((opt) => (
                <ToggleButton 
                    value={opt} 
                    aria-label="setting label" 
                    sx={{ 
                        color: '#a2a5cb',
                        backgroundColor: '#181a29',
                        fontWeight: 600,
                        fontSize: '9px',
                        '&.Mui-selected': {
                            color: '#ffffff',
                            backgroundColor: '#393b60'
                        }
                    }}>
                        {opt}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    )
}