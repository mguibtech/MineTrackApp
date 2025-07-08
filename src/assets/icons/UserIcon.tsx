import Svg, { Path } from "react-native-svg";

import { palette } from "@theme";

import { IconBase } from "../../components/Icons/types";



export function UserIcon({ size = 24, color = palette.greenPrimary, ...props }: IconBase) {
    return (
        <Svg
            width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
            <Path d="M15.8327 17.5V15.8333C15.8327 14.9493 15.4815 14.1014 14.8564 13.4763C14.2312 12.8512 13.3834 12.5 12.4993 12.5H7.49935C6.61529 12.5 5.76745 12.8512 5.14233 13.4763C4.5172 14.1014 4.16602 14.9493 4.16602 15.8333V17.5M13.3327 5.83333C13.3327 7.67428 11.8403 9.16667 9.99935 9.16667C8.1584 9.16667 6.66602 7.67428 6.66602 5.83333C6.66602 3.99238 8.1584 2.5 9.99935 2.5C11.8403 2.5 13.3327 3.99238 13.3327 5.83333Z"
                stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>

    );
}
