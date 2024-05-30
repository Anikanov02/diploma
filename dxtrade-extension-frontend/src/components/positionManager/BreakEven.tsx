import { Button, Checkbox } from "@mui/material";
import React from "react"
import { BreakEvenProps } from "./positionManager.interfaces";

const BreakEven: React.FC<BreakEvenProps> = (props) => {
    const {
        onAction,
        type,
        checked,
        disabled
    } = props;

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
                {type === "button" ? (
                    <Button
                        disabled={disabled === true}
                        onClick={onAction}
                        sx={{ marginRight: '20px', ...buttonStyles }}
                    >
                        Break Even
                    </Button>
                ) : (
                    <Checkbox
                        disabled={disabled === true}
                        checked={checked === true}
                        onChange={onAction}
                        sx={{ marginRight: '20px' }}
                        title="BreakEven" />
                )}
            </div>
        </>
    )
}

export default BreakEven;