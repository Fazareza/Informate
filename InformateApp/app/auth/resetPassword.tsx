import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

// import api from "../../src/api"; // <--- ntar di uncomment
//backend
const requestResetPasswordAPI = async (email: string) => {
  // --- MOCKUP (Hapus blok ini nanti) ---
  console.log(`[DEBUG] Mengirim request reset ke: ${email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulasi sukses
      resolve({ data: { message: "Email sent" } });

      // reject(new Error("Email tidak terdaftar"));
    }, 2000);
  });

  // --- KODE ASLI ( di-uncomment) ---
  // return api.post('/auth/forgot-password', { email: email });
};

export default function ResetPassword() {
  const params = useLocalSearchParams(); // Tangkap parameter dari Profile (kalau ada)

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Efek: Jika ada email dikirim dari halaman Profile, isi otomatis
  useEffect(() => {
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params.email]);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Perhatian", "Mohon isi alamat email Anda.");
      return;
    }
    // Validasi regex sederhana
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Format Salah", "Mohon masukkan format email yang benar.");
      return;
    }

    setIsLoading(true);

    try {
      await requestResetPasswordAPI(email);

      Alert.alert(
        "Link Terkirim! 📧",
        `Kami telah mengirimkan token reset ke email ${email}.`,
        [
          {
            text: "Batal",
            style: "cancel",
          },
          {
            text: "Masukkan Token",
            onPress: () => {
              // Arahkan ke halaman input token & password baru
              router.push("../auth/newPassword");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Terjadi kesalahan pada server.";
      Alert.alert("Gagal Kirim", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Lupa Password?</Text>
        <Text style={styles.subtitle}>
          Jangan khawatir. Masukkan email Anda dan kami akan membantu
          meresetnya.
        </Text>
      </View>

      {/* Input Email */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={20}
          color="#666"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Contoh: nama@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      {/* Tombol Kirim */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kirim Link Reset</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ... styles sama seperti sebelumnya (tidak perlu diubah) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
    backgroundColor: "#FAFAFA",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: "100%", fontSize: 16, color: "#333" },
  button: {
    backgroundColor: "#007BFF",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#A5C9FF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
