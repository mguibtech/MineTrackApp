import Svg, { Path } from "react-native-svg";

import { IconBase } from "../../components/Icons/types";

export function CloseIcon({ size = 24, color = 'grayWhite', ...props }: IconBase) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
            <Path
                d="M6.40002 18.308L5.69202 17.6L11.292 12L5.69202 6.40002L6.40002 5.69202L12 11.292L17.6 5.69202L18.308 6.40002L12.708 12L18.308 17.6L17.6 18.308L12 12.708L6.40002 18.308Z" fill={color} />
        </Svg>

    )
}