import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./search.style";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
function Search() {
  return (
    <SafeAreaView>
      <View style={styles.searchContainer}>
        <TouchableOpacity >
          <Ionicons name="camera-outline" size={34} style={styles.searchIcon} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search furniture..."
            
            onPressIn={() =>{}}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.searchButton}>
            <Feather name="search" size={34} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Search;
