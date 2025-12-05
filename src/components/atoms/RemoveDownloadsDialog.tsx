import { Button, Dialog, Portal, Text } from 'react-native-paper';

export type Props = {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    removeDownloads: ()=>any
}

const RemoveDownloadsDialog = ({ visible, setVisible, removeDownloads }: Props) => {
    const hideDialog = () => setVisible(false);

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Remove Download</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">This book has been downloaded to your device. Would you like to remove it?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={hideDialog}>Cancel</Button>
                    <Button mode="contained" onPress={removeDownloads}>Delete</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default RemoveDownloadsDialog;
