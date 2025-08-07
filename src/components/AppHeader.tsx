import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
    title: string;
    showBackButton?: boolean;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightPress?: () => void;
    backgroundColor?: string;
    textColor?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBackButton = false,
    rightIcon,
    onRightPress,
    backgroundColor = '#fff',
    textColor = '#333'
}) => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <View style={[styles.header, { backgroundColor }]}>
                <View style={styles.leftSection}>
                    {showBackButton && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={24} color={textColor} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.centerSection}>
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                <View style={styles.rightSection}>
                    {rightIcon && onRightPress && (
                        <TouchableOpacity
                            style={styles.rightButton}
                            onPress={onRightPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={rightIcon} size={24} color={textColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
    },
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 5,
        marginLeft: -5,
    },
    rightButton: {
        padding: 5,
        marginRight: -5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default AppHeader;
