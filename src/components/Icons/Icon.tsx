import React from 'react';
import { Pressable } from 'react-native';






import { ArrowDownIcon } from '../../assets/icons/ArrowDownIcon';
import { ArrowLeftIcon } from '../../assets/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '../../assets/icons/ArrowRightIcon';
import { ArrowUpIcon } from '../../assets/icons/ArrowUpIcon';
import { CheckIcon } from '../../assets/icons/CheckIcon';
import { CheckListIcon } from '../../assets/icons/CheckListIcon';
import { CheckRoundIcon } from '../../assets/icons/CheckRoundIcon';
import { CloseIcon } from '../../assets/icons/CloseIcon';
import { EmptySuccessIcon } from '../../assets/icons/EmptySuccessIcon';
import { ErrorRoundIcon } from '../../assets/icons/ErrorRoundIcon';
import { ExitIcon } from '../../assets/icons/ExitIcon';
import { EyeOffIcon } from '../../assets/icons/EyeOffIcon';
import { EyeOnIcon } from '../../assets/icons/EyeOnIcon';
import { HomeIcon } from '../../assets/icons/HomeIcon';
import { LockIcon } from '../../assets/icons/LockIcon';
import { MessageIcon } from '../../assets/icons/MessageIcon';
import { MessageRoundIcon } from '../../assets/icons/MessageRoundIcon';
import { SearchIcon } from '../../assets/icons/SearchIcon';
import { SettingsIcon } from '../../assets/icons/SettingsIcon';
import { UserIcon } from '../../assets/icons/UserIcon';
import { ViolationIcon } from '../../assets/icons/ViolationIcon';
import { WarningIcon } from '../../assets/icons/WarningIcon';
import { ZapIcon } from '../../assets/icons/ZapIcon';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ThemeColors } from '../../theme/theme';


export interface IconProps {
    name: IconName;
    color?: ThemeColors;
    size?: number;
    onPress?: () => void;
}

export function Icon({ name, color = "backgroundContrast", size, onPress }: IconProps) {
    const { colors } = useAppTheme()
    const SVGIcon = iconRegistry[name];

    if (onPress) {
        return <Pressable hitSlop={10} onPress={onPress}>
            <SVGIcon color={colors[color]} size={size} />
        </Pressable>
    }

    return <SVGIcon color={colors[color]} size={size} />

}

const iconRegistry = {
    eyeOff: EyeOffIcon,
    eyeOn: EyeOnIcon,
    arrowLeft: ArrowLeftIcon,
    checkRound: CheckRoundIcon,
    messageRound: MessageRoundIcon,
    violation: ViolationIcon,
    home: HomeIcon,
    exit: ExitIcon,
    search: SearchIcon,
    close: CloseIcon,
    errorRound: ErrorRoundIcon,
    zap: ZapIcon,
    message: MessageIcon,
    check: CheckIcon,
    emptySuccess: EmptySuccessIcon,
    settings: SettingsIcon,
    arrowDown: ArrowDownIcon,
    arrowUp: ArrowUpIcon,
    warning: WarningIcon,
    arrowRight: ArrowRightIcon,
    user: UserIcon,
    lock: LockIcon,
    checkList: CheckListIcon,
}

type IconType = typeof iconRegistry;
type IconName = keyof IconType;