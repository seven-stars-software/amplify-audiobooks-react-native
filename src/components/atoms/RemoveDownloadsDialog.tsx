import { useState } from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper"

export type Props = {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const RemoveDownloadsDialog = ({ visible, setVisible }: Props) => {
    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Alert</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">This is simple dialog</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={hideDialog}>Done</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

export default RemoveDownloadsDialog