import { Svg, Path } from "react-native-svg";


import { IconBase } from "../../components/Icons/types";
import { palette } from "../../theme/theme";

export function CheckListIcon({ size = 24, color = palette.greenPrimary, ...props }: IconBase) {
    return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none" {...props}>
            <Path
                d="M3.375 1.12305H32.625C32.625 1.12305 34.875 1.12305 34.875 3.37305V32.623C34.875 32.623 34.875 34.873 32.625 34.873H3.375C3.375 34.873 1.125 34.873 1.125 32.623V3.37305C1.125 3.37305 1.125 1.12305 3.375 1.12305Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M18 6.74805L11.25 15.748L6.75 11.248M21.375 12.373H28.125M18 20.248L11.25 29.248L6.75 24.748M21.375 25.873H28.125"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round" />
        </Svg>

    );
}
