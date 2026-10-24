import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = "https://lungai-backend-kh6a.onrender.com/analyze";

const THINKING_STEPS = [
  "Initializing Multimodal Decision Support...",
  "Evaluating Clinical Features via XGBoost Model C2...",
  "Analyzing CT Density via PyTorch MobileNetV2...",
  "Synthesizing Grad-CAM Spatial Heatmap...",
  "Generating Explanatory Clinical Assessment...",
];

export default function HomeScreen() {
  // Clinical Inputs
  const [age, setAge] = useState("68");
  const [gender, setGender] = useState("1"); // 1 = Male, 2 = Female
  const [cigsmok, setCigsmok] = useState("1"); // 1 = Smoker
  const [scrRes0, setScrRes0] = useState("4");
  const [noduleSize, setNoduleSize] = useState("18.5");
  const [perpDia, setPerpDia] = useState("14.0");
  const [nodule4mm, setNodule4mm] = useState("2");
  const [spiculated, setSpiculated] = useState("1");
  const [groundGlass, setGroundGlass] = useState("1");
  const [growth, setGrowth] = useState("1");

  // Image State
  const [imageUri, setImageUri] = useState<string | null>(null);

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [displayedReport, setDisplayedReport] = useState("");

  // Step-by-step thinking simulation
  useEffect(() => {
    let interval: any;
    if (loading) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) =>
          prev < THINKING_STEPS.length - 1 ? prev + 1 : prev,
        );
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Typewriter effect for AI Report
  useEffect(() => {
    if (result?.ai_report) {
      setDisplayedReport("");
      let i = 0;
      const fullText = result.ai_report;
      const timer = setInterval(() => {
        if (i < fullText.length) {
          setDisplayedReport(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 18);
      return () => clearInterval(timer);
    }
  }, [result]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission Denied",
        "Camera roll access is required to analyze scans.",
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const runAnalysis = async () => {
    if (!imageUri && !age) {
      Alert.alert(
        "Input Missing",
        "Provide either clinical parameters or a CT image.",
      );
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (age) formData.append("age", age);
    if (gender) formData.append("gender", gender);
    if (cigsmok) formData.append("cigsmok", cigsmok);
    if (scrRes0) formData.append("scr_res0", scrRes0);
    if (noduleSize) formData.append("nodule_size", noduleSize);
    if (perpDia) formData.append("perp_dia", perpDia);
    if (nodule4mm) formData.append("nodule_4mm", nodule4mm);
    if (spiculated) formData.append("spiculated", spiculated);
    if (groundGlass) formData.append("ground_glass", groundGlass);
    if (growth) formData.append("growth", growth);

    if (imageUri) {
      const filename = imageUri.split("/").pop() || "scan.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("ct_image", {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    try {
      const response = await axios.post(BACKEND_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err: any) {
      Alert.alert("Analysis Failed", err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>LUNG-AI DIAGNOSTICS</Text>
          <Text style={styles.subtitle}>
            Multimodal Decision Support System
          </Text>
        </View>

        {/* Clinical Parameters Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clinical Indicators (T0–T2)</Text>
          <View style={styles.grid}>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Sex (1=M, 2=F)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={gender}
                onChangeText={setGender}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Smoker (1=Y)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cigsmok}
                onChangeText={setCigsmok}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Max Nodule (mm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={noduleSize}
                onChangeText={setNoduleSize}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Perp Dia (mm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={perpDia}
                onChangeText={setPerpDia}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Growth (1=Y)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={growth}
                onChangeText={setGrowth}
              />
            </View>
          </View>
        </View>

        {/* Imaging Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Radiological Imaging (CT Scan)</Text>
          <View style={styles.imageRow}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={[styles.previewImage, styles.placeholder]}>
                <Text style={styles.placeholderText}>No Image Selected</Text>
              </View>
            )}
            <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
              <Text style={styles.selectButtonText}>
                {imageUri ? "Change Scan" : "Upload CT"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.buttonDisabled]}
          onPress={runAnalysis}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.analyzeButtonText}>
              RUN MULTIMODAL INFERENCE
            </Text>
          )}
        </TouchableOpacity>

        {/* Thinking Sequence */}
        {loading && (
          <View style={styles.thinkingContainer}>
            <Text style={styles.thinkingStep}>{THINKING_STEPS[stepIndex]}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((stepIndex + 1) / THINKING_STEPS.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Output Diagnostics Panel */}
        {result && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Diagnostic Findings</Text>

            <View style={styles.metricsRow}>
              {result.clinical_early_cancer_risk && (
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Baseline Risk</Text>
                  <Text style={styles.metricValue}>
                    {result.clinical_early_cancer_risk}
                  </Text>
                </View>
              )}
              {result.image_prediction && (
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>CNN Classification</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      result.image_prediction === "Malignant"
                        ? styles.dangerText
                        : styles.safeText,
                    ]}
                  >
                    {result.image_prediction}
                  </Text>
                  <Text style={styles.confidenceText}>
                    Conf: {result.image_confidence}
                  </Text>
                </View>
              )}
            </View>

            {/* Grad-CAM Visualization */}
            {result.heatmap_image_base64 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Grad-CAM Explainability Map
                </Text>
                <Image
                  source={{
                    uri: `data:image/jpeg;base64,${result.heatmap_image_base64}`,
                  }}
                  style={styles.heatmapImage}
                />
                <Text style={styles.captionText}>
                  Spatial activation mapped across final conv layer features.
                </Text>
              </View>
            )}

            {/* AI Synthesized Report */}
            {result.ai_report && (
              <View style={styles.reportBox}>
                <Text style={styles.reportHeader}>Clinical Report</Text>
                <Text style={styles.reportText}>{displayedReport}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B111E" },
  scroll: { padding: 18 },
  header: { marginBottom: 18, marginTop: 10 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#38BDF8",
    letterSpacing: 1.2,
  },
  subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 2 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputBox: { width: "31%", marginBottom: 10 },
  label: { fontSize: 11, color: "#94A3B8", marginBottom: 4 },
  input: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 8,
    color: "#F8FAFC",
    padding: 8,
    fontSize: 13,
    textAlign: "center",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#0F172A",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  placeholderText: { color: "#64748B", fontSize: 10, textAlign: "center" },
  selectButton: {
    backgroundColor: "#0284C7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  analyzeButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.8,
  },
  thinkingContainer: { marginVertical: 12, alignItems: "center" },
  thinkingStep: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#38BDF8" },
  resultsContainer: { marginTop: 10 },
  resultsHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricBox: {
    width: "48%",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  metricLabel: { fontSize: 11, color: "#94A3B8", marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: "800", color: "#F8FAFC" },
  confidenceText: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  dangerText: { color: "#F87171" },
  safeText: { color: "#4ADE80" },
  heatmapImage: {
    width: "100%",
    height: 240,
    borderRadius: 8,
    marginVertical: 8,
  },
  captionText: { fontSize: 11, color: "#64748B", textAlign: "center" },
  reportBox: {
    backgroundColor: "#0F172A",
    borderColor: "#0284C7",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    marginBottom: 30,
  },
  reportHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#38BDF8",
    marginBottom: 6,
  },
  reportText: { fontSize: 13, color: "#E2E8F0", lineHeight: 20 },
});
