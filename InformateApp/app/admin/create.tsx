import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useThemeMode } from "@/hooks/useTheme";
import { useRouter, useFocusEffect } from "expo-router";
import api from "../../src/api"; // Menggunakan API dengan interceptor otomatis

export default function AdminDashboard() {
  const { theme, toggleTheme } = useThemeMode();
  const isDark = theme === "dark";
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. FUNGSI AMBIL DATA (READ)
  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.data);
    } catch (error) {
      console.log("Error fetching:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Panggil saat layar fokus (misal setelah kembali dari halaman Create/Edit)
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Fungsi Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  // 2. FUNGSI HAPUS EVENT (DELETE)
  const handleDelete = (id: number) => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus event ini secara permanen?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true); // Tampilkan loading sebentar
              // Panggil endpoint DELETE backend
              // Header token otomatis disisipkan oleh interceptor di api.js
              await api.delete(`/events/${id}`);
              
              Alert.alert("Sukses", "Data berhasil dihapus");
              fetchEvents(); // Refresh data setelah hapus
            } catch (e: any) {
              console.log("DELETE ERROR:", e.response?.data || e);
              Alert.alert("Gagal", "Tidak bisa menghapus event. Pastikan koneksi aman.");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* TOPBAR */}
      <View style={styles.topbar}>
        <Text style={[styles.topbarTitle, { color: Colors[theme].text }]}>
          Admin Dashboard
        </Text>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          {/* Tombol Tambah (Navigasi ke Create) */}
          <TouchableOpacity onPress={() => router.push("/admin/create")}>
            <Ionicons name="add-circle" size={28} color={Colors[theme].text} />
          </TouchableOpacity>

          {/* Toggle Dark Mode */}
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={26}
              color={Colors[theme].text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION LIST EVENT */}
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        Daftar Event ({events.length})
      </Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors[theme].text} style={{ marginTop: 20 }} />
      ) : (
        events.length === 0 ? (
           <Text style={{textAlign: 'center', marginTop: 20, color: Colors[theme].secondaryText}}>
             Belum ada event. Tekan + untuk menambah.
           </Text>
        ) : (
          events.map((item: any) => (
            <View
              key={item.event_id}
              style={[
                styles.card,
                {
                  backgroundColor: Colors[theme].card,
                  borderColor: Colors[theme].border,
                },
              ]}
            >
              {/* Info Event (Kiri) */}
              <View style={{flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1}}>
                 {/* Gambar Thumbnail (Opsional) */}
                 <Image 
                    source={{uri: item.image_url || 'https://via.placeholder.com/100'}} 
                    style={{width: 60, height: 60, borderRadius: 10, backgroundColor: '#ddd'}} 
                 />
                 
                 <View style={{flex: 1}}>
                    <Text style={[styles.cardTitle, { color: Colors[theme].text }]} numberOfLines={1}>
                      {item.nama_acara}
                    </Text>
                    <Text style={[styles.cardDate, { color: Colors[theme].text }]}>
                      {new Date(item.tanggal_mulai).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.cardSub, { color: Colors[theme].secondaryText }]} numberOfLines={1}>
                      {item.lokasi} • {item.kategori}
                    </Text>
                 </View>
              </View>

              {/* Tombol Aksi (Kanan) */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  onPress={() => router.push({ pathname: "/admin/edit", params: { id: item.event_id } })}
                  style={[styles.btnAction, { backgroundColor: '#f59e0b' }]}
                >
                  <Ionicons name="pencil" size={18} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleDelete(item.event_id)}
                  style={[styles.btnAction, { backgroundColor: '#ef4444' }]}
                >
                  <Ionicons name="trash" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )
      )}
      
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  topbarTitle: { fontSize: 26, fontWeight: "800" },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  
  card: { 
    padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  cardDate: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  cardSub: { fontSize: 12 },
  
  actionRow: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  btnAction: { padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});