import React from 'react';
import { View, Text, TouchableOpacity,TextInput } from 'react-native'; // Import đúng View từ react-native
import { Feather, Ionicons } from '@expo/vector-icons';
import styles from './welcome.style';
import { useNavigation } from '@react-navigation/native';


function Welcome() {
    const navigation = useNavigation();
    return (
        <View>
            {/* Phần tiêu đề */}
            <View style={styles.container}>
                <Text style={styles.welcomeText}>Coffee Shop</Text>
            </View>

            {/* Phần search */}
            <View style={styles.searchContainer}>
                <TouchableOpacity >
                    <Feather name="search" size={34} style={styles.searchIcon} />
                </TouchableOpacity>
                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search furniture..."
                        value=''
                        onFocus={() => navigation.navigate("Search")}
                    />
                </View>
                <View>
                    <TouchableOpacity style={styles.searchButton}>
                        <Ionicons name="camera-outline" size={34} style={styles.searchIcon} />
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}

export default Welcome;
