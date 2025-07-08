import Svg, { Path } from "react-native-svg";

import { IconBase } from "../../components/Icons/types";
import { palette } from "../../theme/theme";

export function CheckIcon({ size = 24, color = palette.greenPrimary, ...props }: IconBase) {
    return (
        <Svg width={size} height={size} viewBox="0 0 16 17" fill="none" {...props}>
            <Path
                d="M13.3334 4.5L6.00008 11.8333L2.66675 8.5"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>

    )
}