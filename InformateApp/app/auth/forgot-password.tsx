import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../../src/api";
import { router } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSend = async () => {
    if (!email) return Alert.alert("Validasi", "Email wajib diisi.");

    try {
      await api.post("/auth/forgot-password", { email });
      Alert.alert("Cek Email Anda", "Instruksi reset password telah dikirim.");
      router.back();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Gagal mengirim permintaan"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="Masukkan email Anda"
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSend}>
        <Text style={styles.btnText}>Kirim Instruksi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
