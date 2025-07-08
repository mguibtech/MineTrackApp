import React, { useState } from "react";

import { TextInput, TextInputPros, Icon } from "@components";

export type PasswordInputProps = Omit<TextInputPros, 'rightComponent'>

export function PasswordInput({ ...rNTextInputProps }: PasswordInputProps) {
    const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

    function toggleSecureTextEntry() {
        setIsSecureTextEntry(prev => !prev);
    }

    return (
        <TextInput
            secureTextEntry={isSecureTextEntry}
            {...rNTextInputProps}
            rightComponent={
                <Icon name={isSecureTextEntry ? "eyeOn" : "eyeOff"} color="gray2" onPress={toggleSecureTextEntry} />}
        />
    )
}