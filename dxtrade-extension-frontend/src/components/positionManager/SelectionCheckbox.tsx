import React, { useEffect, useState } from "react";
import { SinglePositionManagerProps } from "./positionManager.interfaces";
import { Checkbox } from "@mui/material";

const SelectionCheckbox: React.FC<SinglePositionManagerProps> = (props) => {
    const {
        positionId
    } = props;

    const [selected, setSelected] = useState<boolean>(false);

    const handleChange = (event: any) => {
        const action = new CustomEvent('positionSelection', { detail: { selected: !selected, positionId: positionId } });
        window.dispatchEvent(action);
        setSelected(!selected);
    }

    

    useEffect(() => {
        const handleAllPositionSelection = (event: any) => {
            const { selected: allSelected } = event.detail;
            if (allSelected !== selected) {
                const action = new CustomEvent('positionSelection', { detail: { selected: allSelected, positionId } });
                window.dispatchEvent(action);
                setSelected(allSelected);
            }
        }

        window.addEventListener('allPositionSelection', handleAllPositionSelection as EventListener);

        return () => {
          window.removeEventListener('allPositionSelection', handleAllPositionSelection as EventListener);
        };
    }, [selected]);

    return (
        <>
            <div className="customManager table--cell"
                onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}>
                <Checkbox
                    checked={selected}
                    onChange={handleChange}
                    sx={{ marginRight: '20px' }}
                    title="BreakEven" />
            </div>
        </>
    )
}

export default SelectionCheckbox;