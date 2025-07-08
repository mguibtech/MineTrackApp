import Svg, { Path } from "react-native-svg";

import { IconBase } from "../../components/Icons/types";

export function ArrowDownIcon({ size = 20, color = 'black', ...props }: IconBase) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
            <Path fillRule="evenodd" clipRule="evenodd" d="M6 7L12 13L18 7L20 9L12 17L4 9L6 7Z" fill={color} />
        </Svg>
    )
}