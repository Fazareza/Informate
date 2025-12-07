import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "../../src/api";
import Logo from "../../assets/images/logo.png";

export default function RegisterScreen() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    try {
      setErrorMsg("");

      await api.post("/auth/register", {
        nama,
        email,
        password,
      });

      Alert.alert("Sukses", "Akun berhasil dibuat");
      router.replace("/auth/login");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Pendaftaran gagal. Coba lagi.";
      setErrorMsg(msg);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <View style={styles.gradientBg} />

      {/* Card */}
      <View style={styles.card}>
        {/* Logo Bulat */}
        <View style={styles.logoWrapper}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Gabung dengan INFORMATE</Text>

        {/* Nama */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={18}
            color="#2c3e50"
            style={styles.icon}
          />
          <TextInput
            placeholder="Nama lengkap"
            placeholderTextColor="#666"
            style={styles.input}
            value={nama}
            onChangeText={setNama}
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={18}
            color="#2c3e50"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            style={styles.input}
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
          />
        </View>

        {/* Password + Toggle */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color="#2c3e50"
            style={styles.icon}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#2c3e50"
            />
          </TouchableOpacity>
        </View>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Button */}
        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>Daftar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={styles.login}>
            Sudah punya akun? <Text style={{ color: "#2563eb" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f1ff",
    justifyContent: "center",
    alignItems: "center",
  },

  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "linear-gradient(180deg, #dbeafe 0%, #f0f9ff 100%)",
  },

  card: {
    width: "90%",
    maxWidth: 420,
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#93c5fd",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
  },

  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    borderColor: "#25db71ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#21a332ff",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 25,
  },

  inputWrapper: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  icon: {
    marginRight: 8,
  },

  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",

    // fix web TextInput placeholder jumping
    paddingVertical: 0,

    // Hilangkan outline Web
    outlineWidth: 0, // <- boleh
  },

  btn: {
    width: "100%",
    backgroundColor: "#25db71ff",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },

  login: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    color: "#475569",
  },

  error: {
    color: "red",
    marginBottom: 10,
  },
});
