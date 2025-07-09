import Svg, { Rect, Text } from "react-native-svg";
import { IconBase } from "../../components/Icons/types";

export function AppIcon({ size = 1024, ...props }: IconBase) {
    return (
        <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none" {...props}>
            {/* Fundo azul escuro */}
            <Rect width="1024" height="1024" fill="#014955" rx="200" ry="200" />

            {/* Container do logo */}
            <Rect
                x="312"
                y="400"
                width="400"
                height="224"
                fill="rgba(255, 255, 255, 0.2)"
                rx="40"
                ry="40"
            />

            {/* Texto "MT" */}
            <Text
                x="512"
                y="520"
                fontSize="120"
                fontWeight="bold"
                fill="#FFFFFF"
                textAnchor="middle"
            >
                MT
            </Text>
        </Svg>
    );
} 