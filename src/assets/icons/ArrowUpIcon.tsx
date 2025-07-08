import Svg, { Path } from "react-native-svg";

import { IconBase } from "../../components/Icons/types";

export function ArrowUpIcon({ size = 20, color = 'black', ...props }: IconBase) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 17L12 11L6 17L4 15L12 7L20 15L18 17Z" fill={color} />
        </Svg>
    )
}