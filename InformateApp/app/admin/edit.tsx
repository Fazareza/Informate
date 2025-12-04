import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import api from "../../src/api"; // Pastikan path ini benar
import { router, useLocalSearchParams } from "expo-router";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";

export default function EditEvent() {
  const { id } = useLocalSearchParams(); // Ambil ID dari URL
  const { theme } = useThemeMode();
  
  // 1. STATE LENGKAP (Sama seperti database)
  const [form, setForm] = useState({
    nama_acara: "",
    tanggal_mulai: "",
    lokasi: "",
    deskripsi: "",
    kategori: "",
    harga_tiket: "0",
    kuota_maksimal: "0",
    contact_person: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 2. AMBIL DATA SAAT INI
  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const data = res.data.data;
      
      // Format tanggal sederhana untuk ditampilkan di text input
      // Idealnya menggunakan DatePicker, tapi ini solusi cepat text-based
      const dateStr = data.tanggal_mulai ? data.tanggal_mulai.replace('T', ' ').slice(0, 19) : "";
      
      setForm({
        nama_acara: data.nama_acara,
        tanggal_mulai: dateStr,
        lokasi: data.lokasi,
        deskripsi: data.deskripsi || "",
        kategori: data.kategori || "Umum",
        harga_tiket: String(data.harga_tiket || 0),       // Konversi ke string
        kuota_maksimal: String(data.kuota_maksimal || 0), // Konversi ke string
        contact_person: data.contact_person || ""
      });
    } catch (e) {
      Alert.alert("Error", "Gagal mengambil data event");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // 3. SIMPAN PERUBAHAN
  const handleUpdate = async () => {
    setSaving(true);
    try {
      // Kita kirim JSON biasa (bukan FormData) karena edit gambar butuh penanganan khusus di backend
      // yang saat ini belum kita pasang di route PUT.
      await api.put(`/events/${id}`, {
        ...form,
        // Pastikan angka dikirim sebagai angka
        harga_tiket: parseInt(form.harga_tiket) || 0,
        kuota_maksimal: parseInt(form.kuota_maksimal) || 0
      });

      Alert.alert("Berhasil", "Data event diperbarui!");
      router.back();
    } catch (e: any) {
      console.log("UPDATE ERROR:", e.response?.data || e);
      Alert.alert("Error", "Gagal mengupdate event");
    } finally {
      setSaving(false);
    }
  };

  // Style Helper
  const inputStyle = [
     styles.input, 
     { 
        backgroundColor: Colors[theme].card, 
        color: Colors[theme].text,
        borderColor: Colors[theme].border 
     }
  ];
  const labelStyle = [styles.label, { color: Colors[theme].secondaryText }];

  if (loading) {
    return <ActivityIndicator size="large" color={Colors[theme].text} style={{flex: 1}} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Text style={[styles.title, { color: Colors[theme].text }]}>Edit Event</Text>

      {/* --- FORM EDIT --- */}
      <Text style={labelStyle}>Nama Acara</Text>
      <TextInput style={inputStyle} value={form.nama_acara} onChangeText={(t) => setForm({...form, nama_acara: t})} />

      <Text style={labelStyle}>Kategori</Text>
      <TextInput style={inputStyle} value={form.kategori} onChangeText={(t) => setForm({...form, kategori: t})} />

      <Text style={labelStyle}>Tanggal (YYYY-MM-DD HH:MM:SS)</Text>
      <TextInput style={inputStyle} value={form.tanggal_mulai} onChangeText={(t) => setForm({...form, tanggal_mulai: t})} />

      <Text style={labelStyle}>Lokasi</Text>
      <TextInput style={inputStyle} value={form.lokasi} onChangeText={(t) => setForm({...form, lokasi: t})} />

      {/* Baris Harga & Kuota */}
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Harga Tiket (Rp)</Text>
            <TextInput 
                style={inputStyle} 
                value={form.harga_tiket} 
                onChangeText={(t) => setForm({...form, harga_tiket: t})} 
                keyboardType="numeric"
            />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Kuota</Text>
            <TextInput 
                style={inputStyle} 
                value={form.kuota_maksimal} 
                onChangeText={(t) => setForm({...form, kuota_maksimal: t})} 
                keyboardType="numeric"
            />
        </View>
      </View>

      <Text style={labelStyle}>Contact Person</Text>
      <TextInput style={inputStyle} value={form.contact_person} onChangeText={(t) => setForm({...form, contact_person: t})} />

      <Text style={labelStyle}>Deskripsi</Text>
      <TextInput 
        style={[inputStyle, { height: 100, textAlignVertical: 'top' }]} 
        multiline 
        value={form.deskripsi} 
        onChangeText={(t) => setForm({...form, deskripsi: t})} 
      />

      <TouchableOpacity 
         style={[styles.button, saving && {opacity: 0.7}]} 
         onPress={handleUpdate}
         disabled={saving}
      >
        <Text style={styles.btnText}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Text>
      </TouchableOpacity>

      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: "#f59e0b", padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});