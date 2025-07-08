import React from 'react';
import { TextStyle } from 'react-native';

import { createText } from '@shopify/restyle';

import { Theme } from '@theme';

const SRText = createText<Theme>();
type SRTextProps = React.ComponentProps<typeof SRText>;

export interface TextProps extends SRTextProps {
    preset?: TextVariants;
    bold?: boolean;
    italic?: boolean;
    semibold?: boolean;
}

export function Text({
    children,
    preset = 'paragraphMedium',
    style,
    bold,
    italic,
    semibold,
    ...sRTextPropsst
}: TextProps) {

    const fontFamily = getFontFamily(preset, bold, italic, semibold);

    return (
        <SRText
            color="backgroundContrast"
            style={[$fontSizes[preset], { fontFamily }, style]} {...sRTextPropsst}>
            {children}
        </SRText>
    )
}

function getFontFamily(preset: TextVariants, bold?: boolean, italic?: boolean, semibold?: boolean) {
    if (preset === 'headingLarge' || preset === 'headingMedium' || preset === 'headingSmall' || preset === 'headingXLarge') {
        return italic ? $fontFamily.boldItalic : $fontFamily.bold;
    }

    switch (true) {
        case bold && italic:
            return $fontFamily.boldItalic;
        case bold:
            return $fontFamily.bold;
        case italic:
            return $fontFamily.italic;
        case semibold && italic:
            return $fontFamily.mediumItalic;
        case semibold:
            return $fontFamily.medium;
        default:
            return $fontFamily.regular;
    }
}

type TextVariants =
    'headingXLarge'
    | 'headingLarge'
    | 'headingMedium'
    | 'headingSmall'
    | 'paragraphLarge'
    | 'paragraphMedium'
    | 'paragraphSemiMedium'
    | 'paragraphSmall'
    | 'paragraphCaption'
    | 'paragraphCaptionSmall';

export const $fontSizes: Record<TextVariants, TextStyle> = {
    headingXLarge: { fontSize: 64, lineHeight: 64.4 },
    headingLarge: { fontSize: 32, lineHeight: 38.4 },
    headingMedium: { fontSize: 22, lineHeight: 26.4 },
    headingSmall: { fontSize: 18, lineHeight: 23.4 },

    paragraphLarge: { fontSize: 18, lineHeight: 25.2 },
    paragraphMedium: { fontSize: 16, lineHeight: 22.4 },
    paragraphSemiMedium: { fontSize: 14, lineHeight: 22 },
    paragraphSmall: { fontSize: 12, lineHeight: 19.6 },

    paragraphCaption: { fontSize: 12, lineHeight: 16.8 },
    paragraphCaptionSmall: { fontSize: 10, lineHeight: 14 },
}

export const $fontFamily = {
    black: 'Poppins-Black',
    blackItalic: 'Poppins-BlackItalic',
    bold: 'Poppins-Bold',
    boldItalic: 'Poppins-BoldItalic',
    italic: 'Poppins-Italic',
    light: 'Poppins-Light',
    lightItalic: 'Poppins-LightItalic',
    medium: 'Poppins-Medium',
    mediumItalic: 'Poppins-MediumItalic',
    regular: 'Poppins-Regular',
}