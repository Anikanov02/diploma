import { Checkbox } from "@mui/material";
import React, { useEffect, useState } from "react";

const CustomHeader = ({ text, id, type, width }: any) => {
    console.log('custom header', text, id, type)
    return (
        // <th className="header" id={id} >
            <span id={id} className="customTableColumnHeader">
                <span className="table--columnTitle">
                    {
                        type === 'checkbox'
                        ? <SelectAllHeaderCheckbox label={text}/>
                        : text
                    }
                </span>
            </span>
        // </th>
    );
}

const SelectAllHeaderCheckbox = ({label} : any) => {

    const [selected, setSelected] = useState<boolean>(false);

    const handleChange = (event: any) => {
        const action = new CustomEvent('allPositionSelection', { detail: { selected: !selected } });
        window.dispatchEvent(action);
        setSelected(!selected);
    }

    const handleAnyPositionSelection = () => {
        setSelected(false);
    }

    useEffect(() => {
        window.addEventListener('positionSelection', handleAnyPositionSelection as EventListener);

        return () => {
          window.removeEventListener('positionSelection', handleAnyPositionSelection as EventListener);
        };
      }, []);

    return (
        <label>
            <input type="checkbox"
                style={{margin: '0 5px'}}
                checked={selected}
                onChange={handleChange}
            />{label}
        </label>
    )

}

export default CustomHeader;