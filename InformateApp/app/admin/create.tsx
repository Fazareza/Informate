import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from "react-native";
import api from "../../src/api";
import { router } from "expo-router";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

export default function CreateEvent() {
  const { theme } = useThemeMode();

  const [form, setForm] = useState({
    nama_acara: "",
    tanggal_mulai: "",
    lokasi: "",
    deskripsi: "",
    kategori: "",
    harga_tiket: "",
    kuota_maksimal: "",
    contact_person: "",
    image: null as any,
  });

  const [saving, setSaving] = useState(false);

  // PICKER STATES
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);

  // ===== DATE PICKER =====
  const onDatePicked = (event: any, selectedDate?: Date) => {
    setShowDate(false);
    if (!selectedDate) return;

    setPickedDate(selectedDate);
    updateFinalDateTime(selectedDate, null);
  };

  // ===== TIME PICKER =====
  const onTimePicked = (event: any, selectedTime?: Date) => {
    setShowTime(false);
    if (!selectedTime) return;

    updateFinalDateTime(null, selectedTime);
  };

  // ===== COMBINE DATE + TIME =====
  const updateFinalDateTime = (date: Date | null, time: Date | null) => {
    let finalDate = pickedDate || new Date();

    if (date) finalDate = date;
    if (time) {
      finalDate.setHours(time.getHours());
      finalDate.setMinutes(time.getMinutes());
      finalDate.setSeconds(0);
    }

    const formatted = finalDate.toISOString().slice(0, 19).replace("T", " ");
    setForm({ ...form, tanggal_mulai: formatted });
    setPickedDate(finalDate);
  };

  // ===== IMAGE PICKER =====
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm({ ...form, image: result.assets[0] });
    }
  };

  // ===== SAVE EVENT =====
  // ===== SAVE EVENT (VERSI PERBAIKAN) =====
  const handleSave = async () => {
    // 1. Validasi
    if (!form.nama_acara || !form.tanggal_mulai || !form.lokasi) {
      Alert.alert("Validasi", "Nama acara, tanggal, dan lokasi wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      // 2. GUNAKAN FORMDATA (WAJIB UNTUK UPLOAD GAMBAR)
      const formData = new FormData();

      // Masukkan data teks (Semua harus String)
      formData.append('nama_acara', form.nama_acara);
      formData.append('tanggal_mulai', form.tanggal_mulai);
      formData.append('lokasi', form.lokasi);
      formData.append('deskripsi', form.deskripsi || '');
      formData.append('kategori', form.kategori || 'Umum');
      formData.append('harga_tiket', String(form.harga_tiket || '0')); // Ubah angka jadi string
      formData.append('kuota_maksimal', String(form.kuota_maksimal || '0'));
      formData.append('contact_person', form.contact_person || '-');

      // 3. MASUKKAN FILE GAMBAR
      if (form.image) {
        // React Native butuh: uri, name, type
        const uriParts = form.image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('banner_image', {
          uri: form.image.uri,
          name: `photo.${fileType}`, // Nama file
          type: `image/${fileType}`, // Mime type (image/jpeg atau image/png)
        } as any); // 'as any' untuk menghindari error typescript di RN
      }

      // 4. KIRIM REQUEST
      // Header 'Content-Type: multipart/form-data' akan otomatis diatur oleh Axios
      // Jangan set manual!
      await api.post("/events", formData);

      Alert.alert("Sukses", "Event baru berhasil ditambahkan!");
      router.back();
    } catch (e: any) {
      console.log("Error detail:", e);
      Alert.alert("Error", "Gagal menambahkan event baru. Cek koneksi Ngrok.");
    } finally {
      setSaving(false);
    }
  };
  const inputStyle = [
    styles.input,
    {
      backgroundColor: Colors[theme].card,
      color: Colors[theme].text,
      borderColor: Colors[theme].border,
    },
  ];

  const labelStyle = [styles.label, { color: Colors[theme].secondaryText }];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <Text style={[styles.title, { color: Colors[theme].text }]}>
        Buat Event Baru
      </Text>

      {/* IMAGE PICKER */}
      <Text style={labelStyle}>Poster / Gambar Event</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {form.image ? (
          <Image
            source={{ uri: form.image.uri }}
            style={{ width: "100%", height: 180, borderRadius: 12 }}
          />
        ) : (
          <Text style={{ color: Colors[theme].secondaryText }}>
            Tekan untuk memilih gambar event
          </Text>
        )}
      </TouchableOpacity>

      {/* NAMA ACARA */}
      <Text style={labelStyle}>Nama Acara</Text>
      <TextInput
        style={inputStyle}
        placeholder="Contoh: Seminar AI Nasional"
        placeholderTextColor={Colors[theme].secondaryText}
        value={form.nama_acara}
        onChangeText={(t) => setForm({ ...form, nama_acara: t })}
      />

      {/* KATEGORI */}
      <Text style={labelStyle}>Kategori</Text>
      <TextInput
        style={inputStyle}
        placeholder="Contoh: Workshop, Seminar, Festival"
        placeholderTextColor={Colors[theme].secondaryText}
        value={form.kategori}
        onChangeText={(t) => setForm({ ...form, kategori: t })}
      />

      {/* DATE PICKER */}
      <Text style={labelStyle}>Tanggal Acara</Text>
      <TouchableOpacity
        style={[inputStyle, { justifyContent: "center" }]}
        onPress={() => setShowDate(true)}
      >
        <Text
          style={{
            color: form.tanggal_mulai
              ? Colors[theme].text
              : Colors[theme].secondaryText,
          }}
        >
          {pickedDate ? pickedDate.toLocaleDateString() : "Pilih tanggal acara"}
        </Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={pickedDate || new Date()}
          mode="date"
          display="calendar"
          onChange={onDatePicked}
        />
      )}

      {/* TIME PICKER */}
      <Text style={labelStyle}>Waktu Acara</Text>
      <TouchableOpacity
        style={[inputStyle, { justifyContent: "center" }]}
        onPress={() => setShowTime(true)}
      >
        <Text
          style={{
            color: form.tanggal_mulai
              ? Colors[theme].text
              : Colors[theme].secondaryText,
          }}
        >
          {pickedDate
            ? pickedDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "Pilih waktu acara"}
        </Text>
      </TouchableOpacity>

      {showTime && (
        <DateTimePicker
          value={pickedDate || new Date()}
          mode="time"
          display="default"
          onChange={onTimePicked}
        />
      )}

      {/* LOKASI */}
      <Text style={labelStyle}>Lokasi</Text>
      <TextInput
        style={inputStyle}
        placeholder="Contoh: Aula Fakultas Teknik"
        placeholderTextColor={Colors[theme].secondaryText}
        value={form.lokasi}
        onChangeText={(t) => setForm({ ...form, lokasi: t })}
      />

      {/* HARGA + KUOTA */}
      <View style={{ flexDirection: "row", gap: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>Harga Tiket</Text>
          <TextInput
            style={inputStyle}
            placeholder="0 jika gratis"
            placeholderTextColor={Colors[theme].secondaryText}
            keyboardType="numeric"
            value={form.harga_tiket}
            onChangeText={(t) => setForm({ ...form, harga_tiket: t })}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>Kuota</Text>
          <TextInput
            style={inputStyle}
            placeholder="Peserta maksimal"
            placeholderTextColor={Colors[theme].secondaryText}
            keyboardType="numeric"
            value={form.kuota_maksimal}
            onChangeText={(t) => setForm({ ...form, kuota_maksimal: t })}
          />
        </View>
      </View>

      {/* CP */}
      <Text style={labelStyle}>Contact Person</Text>
      <TextInput
        style={inputStyle}
        placeholder="Contoh: 0812-3456-7890 (Admin)"
        placeholderTextColor={Colors[theme].secondaryText}
        value={form.contact_person}
        onChangeText={(t) => setForm({ ...form, contact_person: t })}
      />

      {/* DESKRIPSI */}
      <Text style={labelStyle}>Deskripsi</Text>
      <TextInput
        style={[inputStyle, { height: 100, textAlignVertical: "top" }]}
        placeholder="Tambahkan deskripsi lengkap mengenai event..."
        placeholderTextColor={Colors[theme].secondaryText}
        multiline
        value={form.deskripsi}
        onChangeText={(t) => setForm({ ...form, deskripsi: t })}
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.6 }]}
        disabled={saving}
        onPress={handleSave}
      >
        <Text style={styles.btnText}>
          {saving ? "Menyimpan..." : "Simpan Event"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 15 },

  imagePicker: {
    borderWidth: 1,
    borderRadius: 12,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
