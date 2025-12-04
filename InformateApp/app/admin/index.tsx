import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useThemeMode } from "@/hooks/useTheme"; // Hook asli Anda
import { useRouter, useFocusEffect } from "expo-router";
import api, { getJsonHeader } from "../../src/api";

export default function AdminDashboard() {
  const { theme, toggleTheme } = useThemeMode(); // Tetap pakai ini
  const isDark = theme === "dark";
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil Data Event saat layar dibuka
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const fetchEvents = async () => {
    try {
      // Endpoint disesuaikan dengan backend kita (/events)
      const res = await api.get("/events"); 
      setEvents(res.data.data);
    } catch (error) {
      console.log("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Hapus Event
  const handleDelete = (id: any) => {
    Alert.alert("Hapus Event", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const headers = await getJsonHeader();
            await api.delete(`/events/${id}`, headers);
            Alert.alert("Sukses", "Data dihapus");
            fetchEvents(); // Refresh list
          } catch (e) {
            Alert.alert("Gagal", "Tidak bisa menghapus event");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      {/* TOPBAR */}
      <View style={styles.topbar}>
        <Text style={[styles.topbarTitle, { color: Colors[theme].text }]}>
          Admin Dashboard
        </Text>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          {/* Tombol Tambah Event (Arahkan ke create) */}
          <TouchableOpacity onPress={() => router.push("/admin/create")}>
            <Ionicons name="add-circle" size={28} color="#2563eb" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={26}
              color={Colors[theme].text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ANALYTICS SECTION (Static untuk sementara) */}
      <View style={styles.analyticsRow}>
        {/* ... (Kode Card Analytics Anda biarkan sama, tidak saya ubah) ... */}
         <View style={[styles.analyticsCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
            <Ionicons name="people-outline" size={30} color="#2563eb" />
            <Text style={[styles.analyticsNumber, { color: Colors[theme].text }]}>1,241</Text>
            <Text style={[styles.analyticsLabel, { color: Colors[theme].secondaryText }]}>Total Users</Text>
         </View>
         <View style={[styles.analyticsCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
            <Ionicons name="calendar-outline" size={30} color="#10b981" />
            <Text style={[styles.analyticsNumber, { color: Colors[theme].text }]}>{events.length}</Text>
            <Text style={[styles.analyticsLabel, { color: Colors[theme].secondaryText }]}>Total Events</Text>
         </View>
         <View style={[styles.analyticsCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
            <Ionicons name="shield-checkmark-outline" size={30} color="#f59e0b" />
            <Text style={[styles.analyticsNumber, { color: Colors[theme].text }]}>3</Text>
            <Text style={[styles.analyticsLabel, { color: Colors[theme].secondaryText }]}>Admins</Text>
         </View>
      </View>

      {/* LIST EVENT (DYNAMIC) */}
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        Daftar Event
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors[theme].text} />
      ) : events.map((item: any) => (
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
            {/* Tampilkan Gambar Kecil jika ada */}
            <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
               {item.image_url ? (
                  <Image source={{uri: item.image_url}} style={{width: 50, height: 50, borderRadius: 8}} />
               ) : null}
               
               <View style={{flex: 1}}>
                  <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>
                    {item.nama_acara}
                  </Text>
                  <Text style={[styles.cardDate, { color: Colors[theme].secondaryText }]}>
                    {new Date(item.tanggal_mulai).toDateString()}
                  </Text>
               </View>
            </View>

            {/* ACTION BUTTONS (Edit & Delete) */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                onPress={() => router.push({ pathname: "/admin/edit", params: { id: item.event_id } })}
                style={[styles.btnAction, { backgroundColor: '#f59e0b' }]}
              >
                <Ionicons name="pencil" size={16} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleDelete(item.event_id)}
                style={[styles.btnAction, { backgroundColor: '#ef4444' }]}
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  topbarTitle: { fontSize: 26, fontWeight: "800" },
  analyticsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  analyticsCard: { width: "30%", paddingVertical: 18, borderRadius: 18, borderWidth: 1, alignItems: "center" },
  analyticsNumber: { fontSize: 24, fontWeight: "800", marginTop: 6 },
  analyticsLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  
  // Update Card Style
  card: { 
    padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 14, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDate: { marginTop: 4, fontSize: 12 },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  btnAction: { padding: 8, borderRadius: 8 }
});