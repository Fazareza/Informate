import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import api from "@/src/api";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeMode();
  const c = Colors[theme];

  // State untuk data user
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fungsi Ambil Data Profil
  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me'); // Panggil endpoint backend yg baru dibuat
      setUser(res.data.data);
    } catch (error) {
      console.log("Gagal ambil profil:", error);
      // Jika token expired/error, arahkan ke login (opsional)
      // router.replace('/auth/login'); 
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Panggil saat layar dibuka
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  // 2. Fungsi Logout
  const handleLogout = async () => {
    Alert.alert("Konfirmasi", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Hapus token dari penyimpanan HP
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          
          // Kembali ke halaman login dan reset stack navigasi
          router.dismissAll();
          router.replace("/auth/login");
        }
      }
    ]);
  };

  // Generate Avatar dari Nama (karena DB belum ada kolom foto)
  const getAvatarUrl = (name: string) => {
    const cleanName = name ? name.replace(/\s+/g, '+') : 'User';
    return `https://ui-avatars.com/api/?name=${cleanName}&background=random&color=fff&size=256`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={c.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Profile</Text>

        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={theme === "dark" ? "sunny-outline" : "moon-outline"}
            size={24}
            color={c.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* User info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: getAvatarUrl(user?.nama || "User") }} 
            style={styles.avatar} 
          />
          <Text style={[styles.name, { color: c.text }]}>
            {user?.nama || "Pengguna"}
          </Text>
          <Text style={[styles.email, { color: c.secondaryText }]}>
            {user?.email || "email@unknown.com"}
          </Text>
           {/* Menampilkan Role (Optional) */}
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Menu section */}
        <View style={styles.menuWrapper}>
          {/* Tombol ke Reset Password (dengan passing email asli) */}
          <MenuItem
            icon="key-outline"
            label="Ganti Password"
            color={c.text}
            onPress={() => router.push({
               pathname: "./auth/resetPassword",
               params: { email: user?.email } // Kirim email asli ke form reset
            })}
          />
          
          <MenuItem
            icon="bookmark-outline"
            label="Event Tersimpan"
            color={c.text}
            onPress={() => router.push("/(tabs)/bookmark" as any)} // Arahkan ke tab bookmark jika ada
          />
          
          <MenuItem
            icon="information-circle-outline"
            label="Tentang Aplikasi"
            color={c.text}
            onPress={() => Alert.alert("Informate App", "Versi 1.0.0\nDeveloped by Kelompok Anda")}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* COMPONENT: Menu Item Helper */
const MenuItem = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={color}
      style={{ opacity: 0.5 }}
    />
  </TouchableOpacity>
);

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  profileSection: {
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 30,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc'
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center"
  },

  email: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },

  roleBadge: {
    marginTop: 8,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0284c7'
  },

  menuWrapper: {
    marginTop: 10,
    paddingHorizontal: 20,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150,150,150,0.2)",
  },

  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 15,
  },

  logoutBtn: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    padding: 10,
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
  },
});